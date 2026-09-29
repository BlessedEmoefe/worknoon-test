import { REFUND_POLICY } from "@/lib/refund-policy";
import { getAIRefundDecision } from "@/lib/ai-refund";
import type { RefundDecision } from "@/types/refund";

/** Shape of a line item stored on an Order (JSON column). */
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  isFinalSale: boolean;
}

/** Minimal order fields the rule engine needs to evaluate a request. */
export interface OrderForEvaluation {
  status: string;
  orderDate: Date;
  totalAmount: number;
  items: OrderItem[];
}

export interface EvaluateRefundInput {
  order: OrderForEvaluation;
  reason: string;
  customerMessage: string;
  requestedAmount?: number;
}

export interface EvaluateRefundOutput {
  decision: RefundDecision;
  reasoning: string;
  policyNotes: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_REFUND_AGE_DAYS = 30;
const HIGH_VALUE_THRESHOLD = 500;

/**
 * Result of the hard-rule safety layer.
 * - forcedDecision: locks the outcome (Denied / Escalated); AI cannot override it.
 * - null forcedDecision: hard rules did not lock the case → AI decides.
 */
interface HardRuleResult {
  forcedDecision: "Denied" | "Escalated" | null;
  reasoning: string;
  policyNotes: string;
}

/**
 * AI-enhanced refund evaluator.
 *
 * Safety layers (in order):
 * 1. Hard rules — deterministic Denied / Escalated locks (cannot be overridden by AI)
 * 2. OpenAI policy reasoning — used only when hard rules do not force Denied/Escalated
 * 3. Combined reasoning — hard-rule notes + AI explanation for auditability
 *
 * Final decision priority:
 * 1. Hard rules that force Denied → Denied
 * 2. Hard rules that force Escalated (e.g. > $500) → Escalated (AI may add notes)
 * 3. Otherwise → AI decision
 */
export async function evaluateRefundRequest(
  input: EvaluateRefundInput
): Promise<EvaluateRefundOutput> {
  const hard = applyHardRules(input);

  // Layer 1a: Hard Denied — skip AI entirely (cheaper + safer).
  if (hard.forcedDecision === "Denied") {
    return {
      decision: "Denied",
      reasoning: `[Hard rule] ${hard.reasoning}`,
      policyNotes: hard.policyNotes,
    };
  }

  // Layer 2: Call AI for policy-aware reasoning whenever the case is not hard-Denied.
  const ai = await getAIRefundDecision({
    order: input.order,
    reason: input.reason,
    customerMessage: input.customerMessage,
    requestedAmount: input.requestedAmount,
    refundPolicy: REFUND_POLICY,
  });

  // Layer 1b: Hard Escalated (e.g. amount > $500) — AI cannot downgrade this.
  if (hard.forcedDecision === "Escalated") {
    return {
      decision: "Escalated",
      reasoning: [
        `[Hard rule] ${hard.reasoning}`,
        `[AI notes] ${ai.reasoning}`,
      ].join("\n\n"),
      policyNotes: [
        hard.policyNotes,
        "---",
        `[AI policyNotes] ${ai.policyNotes}`,
      ].join("\n"),
    };
  }

  // Layer 3: No hard lock — use the AI decision, keep hard-rule context for the audit trail.
  return {
    decision: ai.decision,
    reasoning: [
      "[Hard rules] No forced Denied/Escalated. Passed to AI for policy evaluation.",
      `[AI] ${ai.reasoning}`,
    ].join("\n\n"),
    policyNotes: [
      "Hard rules: cleared (delivered, not final-sale lock, within 30 days, ≤ $500).",
      "---",
      `[AI policyNotes] ${ai.policyNotes}`,
    ].join("\n"),
  };
}

/**
 * Deterministic hard rules (first safety layer).
 * Only forces Denied or Escalated — never Approves (approval is left to AI / humans).
 */
function applyHardRules(input: EvaluateRefundInput): HardRuleResult {
  const { order, requestedAmount } = input;
  const amountToCheck =
    requestedAmount !== undefined ? requestedAmount : order.totalAmount;

  // Rule 1: Only delivered orders are eligible.
  if (order.status.toLowerCase() !== "delivered") {
    return {
      forcedDecision: "Denied",
      reasoning: `Order status is "${order.status}", not "delivered". Refunds are only allowed for delivered orders.`,
      policyNotes: excerptPolicy(
        "Section 2.1 (Delivered Orders Only)",
        'Refunds are only possible for orders with a status of "delivered".'
      ),
    };
  }

  // Rule 2: Any final-sale item on the order → Denied.
  const hasFinalSaleItem = order.items.some((item) => item.isFinalSale);
  if (hasFinalSaleItem) {
    return {
      forcedDecision: "Denied",
      reasoning:
        "This order contains one or more final sale items, which are not eligible for refunds under current hard rules.",
      policyNotes: excerptPolicy(
        "Section 3 (Final Sale Items)",
        "Items marked as final sale are not eligible for refunds."
      ),
    };
  }

  // Rule 3: Orders older than 30 days → Denied.
  const ageInDays =
    (Date.now() - new Date(order.orderDate).getTime()) / DAY_MS;
  if (ageInDays > MAX_REFUND_AGE_DAYS) {
    return {
      forcedDecision: "Denied",
      reasoning: `This order is ${Math.floor(ageInDays)} days old, which exceeds the ${MAX_REFUND_AGE_DAYS}-day refund window.`,
      policyNotes: excerptPolicy(
        "Section 2.3 (Order Age Limit)",
        "Orders older than 30 days from the order date cannot be refunded."
      ),
    };
  }

  // Rule 4: Amount over $500 → Escalated (hard lock; AI cannot Approve).
  if (amountToCheck > HIGH_VALUE_THRESHOLD) {
    return {
      forcedDecision: "Escalated",
      reasoning: `Refund amount of $${amountToCheck.toFixed(2)} exceeds the $${HIGH_VALUE_THRESHOLD} automated approval limit and requires human review.`,
      policyNotes: excerptPolicy(
        "Section 4 (High-Value Refunds)",
        "Refunds above $500 require human review and must be Escalated."
      ),
    };
  }

  // No hard lock — AI may decide Approved / Denied / Escalated.
  return {
    forcedDecision: null,
    reasoning: "Hard rules passed.",
    policyNotes: "No hard-rule denial or forced escalation.",
  };
}

/** Builds a short policyNotes string with a section label and a relevant quote. */
function excerptPolicy(section: string, highlight: string): string {
  return [
    `Applied: ${section}`,
    `Relevant policy: ${highlight}`,
    "",
    "Full policy reference available in REFUND_POLICY.",
    REFUND_POLICY.slice(0, 400) + "…",
  ].join("\n");
}
