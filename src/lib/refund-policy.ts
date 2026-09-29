export const REFUND_POLICY = `
WORKNOON REFUND POLICY
Effective Date: January 1, 2026
Version: 1.0

This Refund Policy governs all refund requests submitted through the Worknoon AI Refund System. Customer service agents and automated decision systems must apply these rules consistently and in full. When multiple rules apply, the most restrictive applicable rule controls the outcome.

────────────────────────────────────────
1. PURPOSE AND SCOPE
────────────────────────────────────────

Worknoon aims to resolve refund requests fairly, quickly, and in line with this policy. This document covers refund eligibility, approval criteria, automatic denial conditions, and cases that require human review (escalation).

Refund decisions fall into one of three outcomes:
  • Approved  — the request meets policy and may be processed.
  • Denied    — the request does not meet policy and must be declined.
  • Escalated — the request needs human review before a final decision.

────────────────────────────────────────
2. ELIGIBILITY REQUIREMENTS
────────────────────────────────────────

2.1 Delivered Orders Only
Refunds are only possible for orders with a status of "delivered". Orders that are still processing, shipped but not delivered, cancelled, or otherwise incomplete are not eligible for a refund under this policy.

2.2 Clear Reason Required
Customers must provide a clear, understandable reason for the refund request. Vague statements (for example, "I just want my money back" with no further detail) or empty reasons do not satisfy this requirement. The reason should describe what went wrong or why a refund is sought (for example: damaged item, wrong size, defective product, incorrect item received).

2.3 Order Age Limit (30 Days)
Orders older than 30 days from the order date cannot be refunded. The 30-day window is measured from the order date to the date the refund request is submitted. Requests for orders placed more than 30 days ago must be Denied, regardless of other factors (except where a separate statutory right applies—those cases should be Escalated for legal review).

────────────────────────────────────────
3. FINAL SALE ITEMS
────────────────────────────────────────

3.1 Final Sale Exclusion
Items marked as final sale are not eligible for refunds. If a refund request includes one or more final sale items, those items must be excluded from any refund amount.

3.2 Entirely Final Sale Orders
If every item on the order is marked final sale, the refund request must be Denied.

3.3 Mixed Orders
If an order contains both refundable and final sale items, only the non–final sale items may be considered for refund, subject to all other rules in this policy. Final sale items must never be refunded.

────────────────────────────────────────
4. HIGH-VALUE REFUNDS (ABOVE $500)
────────────────────────────────────────

Refunds above $500 require human review and must be Escalated. This applies when:
  • The customer’s requested refund amount exceeds $500, or
  • The eligible refund amount (after applying other policy exclusions) would exceed $500, or
  • The order’s total amount exceeds $500 and the customer is seeking a full or substantial refund of that order.

Automated systems must not Approve refunds above $500. Escalate them for a human agent to verify the claim, inspect supporting details, and authorize or decline the refund.

────────────────────────────────────────
5. QUALIFYING GROUNDS FOR APPROVAL
────────────────────────────────────────

Subject to Sections 2–4 and 6–7, the following situations may qualify for Approval:

5.1 Damaged Items
The customer reports that an item arrived damaged (broken, cracked, water-damaged, or similarly compromised during shipping or upon receipt).

5.2 Defective Items
The customer reports that an item does not work as intended due to a manufacturing or product defect (for example: device will not power on, zipper broken out of the box, electronic failure within normal use).

5.3 Incorrect Items
The customer received the wrong product, wrong size, wrong color, or wrong variant compared to what was ordered.

When these grounds are clearly described, the order is delivered, the request is within 30 days, items are not final sale, and the amount does not exceed $500, Approval is generally appropriate.

────────────────────────────────────────
6. SUSPICIOUS OR CONFLICTING REQUESTS
────────────────────────────────────────

Suspicious or conflicting requests should be Escalated for human review. Indicators include, but are not limited to:
  • The customer’s stated reason contradicts order or item data (for example, claiming an item was never delivered when status is delivered, or claiming damage on a digital/non-physical line item).
  • Multiple conflicting explanations in the same request.
  • Patterns suggesting abuse (repeated refunds for similar high-value items in a short period, when visible from history).
  • Requested amount that does not match order totals or item prices in a way that cannot be explained.
  • Incomplete or inconsistent customer messages that make the claim unverifiable by automated means.

Do not Approve or Deny automatically when suspicion or conflict is present—Escalate.

────────────────────────────────────────
7. DECISION GUIDANCE SUMMARY
────────────────────────────────────────

Deny when any of the following is true:
  • Order status is not "delivered".
  • Order is older than 30 days.
  • Request covers only final sale items (or no eligible refundable amount remains).
  • Customer did not provide a clear reason.

Escalate when any of the following is true:
  • Refund amount (requested or eligible) is above $500.
  • Request appears suspicious or contains conflicting information.
  • Policy outcome is ambiguous and a human judgment is needed.

Approve when all of the following are true:
  • Order is delivered.
  • Order date is within the last 30 days.
  • Customer provided a clear reason.
  • Eligible items are not final sale (or only non–final sale portion is refunded).
  • Refund amount does not exceed $500.
  • Reason aligns with damaged, defective, incorrect item, or another clearly valid ground consistent with this policy.
  • No indicators require escalation.

────────────────────────────────────────
8. POLICY APPLICATION NOTES FOR AI SYSTEMS
────────────────────────────────────────

• Always evaluate rules in order of restrictiveness: eligibility (delivered, reason, age) → final sale → amount threshold → quality of claim → approve / deny / escalate.
• Prefer Escalation over Approval when uncertain.
• Never invent facts not present in the order, customer message, or item data.
• Document which policy sections supported the decision in the reasoning output.
• Partial refunds are allowed when only some items are eligible (for example, mixed final sale and regular items).

────────────────────────────────────────
9. CONTACT AND REVIEW
────────────────────────────────────────

This policy is maintained by Worknoon Customer Operations. Escalated cases are routed to a human refund specialist. Customers denied under this policy may request a secondary human review; that review remains bound by the same rules unless a documented exception is approved by a supervisor.

End of Worknoon Refund Policy.
`.trim();

