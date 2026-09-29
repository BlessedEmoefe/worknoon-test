import { REFUND_POLICY } from "@/lib/refund-policy";
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

/** Keywords that indicate a strong, policy-aligned refund ground. */
const APPROVAL_KEYWORDS = [
  "damaged",
  "defective",
  "wrong item",
  "incorrect",
] as const;

/**
 * Pure rule-based refund evaluator (no AI).
 * Rules are applied in order; the first matching hard rule wins.
 */
export function evaluateRefundRequest(
  input: EvaluateRefundInput
): EvaluateRefundOutput {
  const { order, reason, customerMessage, requestedAmount } = input;
  const combinedText = `${reason} ${customerMessage}`.toLowerCase();
  const amountToCheck =
    requestedAmount !== undefined ? requestedAmount : order.totalAmount;

  // Rule 1: Only delivered orders are eligible.
  if (order.status.toLowerCase() !== "delivered") {
    return {
      decision: "Denied",
      reasoning: `Order status is "${order.status}", not "delivered". Refunds are only allowed for delivered orders.`,
      policyNotes: excerptPolicy(
        "Section 2.1 (Delivered Orders Only)",
        "Refunds are only possible for orders with a status of \"delivered\"."
      ),
    };
  }

  // Rule 2: Any final-sale item on the order → Denied.
  const hasFinalSaleItem = order.items.some((item) => item.isFinalSale);
  if (hasFinalSaleItem) {
    return {
      decision: "Denied",
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
      decision: "Denied",
      reasoning: `This order is ${Math.floor(ageInDays)} days old, which exceeds the ${MAX_REFUND_AGE_DAYS}-day refund window.`,
      policyNotes: excerptPolicy(
        "Section 2.3 (Order Age Limit)",
        "Orders older than 30 days from the order date cannot be refunded."
      ),
    };
  }

  // Rule 4: Amount over $500 → Escalated for human review.
  if (amountToCheck > HIGH_VALUE_THRESHOLD) {
    return {
      decision: "Escalated",
      reasoning: `Refund amount of $${amountToCheck.toFixed(2)} exceeds the $${HIGH_VALUE_THRESHOLD} automated approval limit and requires human review.`,
      policyNotes: excerptPolicy(
        "Section 4 (High-Value Refunds)",
        "Refunds above $500 require human review and must be Escalated."
      ),
    };
  }

  // Rule 5: Clear qualifying keywords → Approved.
  const matchedKeyword = APPROVAL_KEYWORDS.find((keyword) =>
    combinedText.includes(keyword)
  );
  if (matchedKeyword) {
    return {
      decision: "Approved",
      reasoning: `Customer cited "${matchedKeyword}", which is a qualifying ground for approval. Order is delivered, within ${MAX_REFUND_AGE_DAYS} days, under $${HIGH_VALUE_THRESHOLD}, and has no final sale items.`,
      policyNotes: excerptPolicy(
        "Section 5 (Qualifying Grounds for Approval)",
        "Damaged, defective, or incorrect items may qualify for approval when other eligibility rules are met."
      ),
    };
  }

  // Rule 6: Default → Escalated for human review.
  return {
    decision: "Escalated",
    reasoning:
      "No automatic approval or denial rule matched with high confidence. The request is escalated for human review.",
    policyNotes: excerptPolicy(
      "Section 6 & 7 (Escalation Guidance)",
      "Suspicious, conflicting, or ambiguous requests should be escalated. Prefer Escalation over Approval when uncertain."
    ),
  };
}

/** Builds a short policyNotes string with a section label and a relevant quote. */
function excerptPolicy(section: string, highlight: string): string {
  return [
    `Applied: ${section}`,
    `Relevant policy: ${highlight}`,
    "",
    "Full policy reference available in REFUND_POLICY.",
    // Keep a compact slice of the full policy for audit / AI context later.
    REFUND_POLICY.slice(0, 400) + "…",
  ].join("\n");
}
