export type RefundDecision = "Approved" | "Denied" | "Escalated";

export interface RefundRequestInput {
  customerEmail: string;
  orderNumber: string;
  reason: string;
  customerMessage: string;
  requestedAmount?: number;
}

export interface RefundRequestResult {
  decision: RefundDecision;
  reasoning: string;
  policyNotes: string;
  orderTotal: number;
  orderDate: string;
  customerName: string;
  refundRequestId: string;
}
