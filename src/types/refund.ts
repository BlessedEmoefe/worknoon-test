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

/** Shape returned by GET /api/refund for the admin dashboard. */
export interface AdminRefundRequest {
  id: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  decision: RefundDecision;
  requestedAmount: number | null;
  reason: string;
  reasoning: string;
  policyNotes: string | null;
}
