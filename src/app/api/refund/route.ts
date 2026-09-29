import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  evaluateRefundRequest,
  type OrderItem,
} from "@/lib/refund-engine";
import type {
  RefundRequestInput,
  RefundRequestResult,
} from "@/types/refund";

/**
 * POST /api/refund
 * Submits a refund request, runs hard rules + AI evaluation, and persists the result.
 *
 * Flow:
 * 1. Validate input and load customer/order
 * 2. evaluateRefundRequest → hard-rule safety layer, then OpenAI when not hard-Denied
 * 3. Persist decision + reasoning and return JSON
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RefundRequestInput>;

    // --- Validate required fields ---
    const { customerEmail, orderNumber, reason, customerMessage } = body;
    const requestedAmount = body.requestedAmount;

    if (!customerEmail?.trim() || !orderNumber?.trim() || !reason?.trim() || !customerMessage?.trim()) {
      return NextResponse.json(
        {
          error:
            "Missing required fields. Provide customerEmail, orderNumber, reason, and customerMessage.",
        },
        { status: 400 }
      );
    }

    if (
      requestedAmount !== undefined &&
      (typeof requestedAmount !== "number" || Number.isNaN(requestedAmount) || requestedAmount < 0)
    ) {
      return NextResponse.json(
        { error: "requestedAmount must be a non-negative number when provided." },
        { status: 400 }
      );
    }

    // --- Look up customer (case-insensitive email) ---
    const customerResolved = await prisma.customer.findFirst({
      where: {
        email: { equals: customerEmail.trim(), mode: "insensitive" },
      },
    });

    if (!customerResolved) {
      return NextResponse.json(
        { error: `Customer not found for email: ${customerEmail}` },
        { status: 404 }
      );
    }

    // --- Look up order and verify ownership ---
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderNumber.trim() },
    });

    if (!order || order.customerId !== customerResolved.id) {
      return NextResponse.json(
        {
          error: `Order "${orderNumber}" was not found for this customer.`,
        },
        { status: 404 }
      );
    }

    const items = order.items as unknown as OrderItem[];

    // --- Hard rules + AI (OpenAI) evaluation ---
    const evaluation = await evaluateRefundRequest({
      order: {
        status: order.status,
        orderDate: order.orderDate,
        totalAmount: order.totalAmount,
        items,
      },
      reason: reason.trim(),
      customerMessage: customerMessage.trim(),
      requestedAmount,
    });

    // --- Persist refund request ---
    const refundRequest = await prisma.refundRequest.create({
      data: {
        customerId: customerResolved.id,
        orderId: order.id,
        reason: reason.trim(),
        customerMessage: customerMessage.trim(),
        requestedAmount: requestedAmount ?? null,
        decision: evaluation.decision,
        aiReasoning: evaluation.reasoning,
        policyNotes: evaluation.policyNotes,
      },
    });

    const result: RefundRequestResult = {
      decision: evaluation.decision,
      reasoning: evaluation.reasoning,
      policyNotes: evaluation.policyNotes,
      orderTotal: order.totalAmount,
      orderDate: order.orderDate.toISOString(),
      customerName: customerResolved.name,
      refundRequestId: refundRequest.id,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/refund failed:", error);
    return NextResponse.json(
      { error: "Internal server error while processing refund request." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/refund
 * Returns the latest 20 refund requests for the admin dashboard.
 */
export async function GET() {
  try {
    const refunds = await prisma.refundRequest.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, email: true } },
        order: { select: { orderNumber: true } },
      },
    });

    const payload = refunds.map((refund: (typeof refunds)[number]) => ({
      id: refund.id,
      createdAt: refund.createdAt.toISOString(),
      customerName: refund.customer.name,
      customerEmail: refund.customer.email,
      orderNumber: refund.order.orderNumber,
      decision: refund.decision,
      requestedAmount: refund.requestedAmount,
      reason: refund.reason,
      reasoning: refund.aiReasoning,
      policyNotes: refund.policyNotes,
    }));

    return NextResponse.json({ refunds: payload });
  } catch (error) {
    console.error("GET /api/refund failed:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching refund requests." },
      { status: 500 }
    );
  }
}
