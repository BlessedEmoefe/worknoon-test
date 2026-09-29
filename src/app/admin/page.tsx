"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AdminRefundRequest, RefundDecision } from "@/types/refund";

const DECISION_STYLES: Record<RefundDecision, string> = {
  Approved: "bg-green-100 text-green-800 ring-green-600/20",
  Denied: "bg-red-100 text-red-800 ring-red-600/20",
  Escalated: "bg-amber-100 text-amber-900 ring-amber-600/20",
};

export default function AdminDashboardPage() {
  const [refunds, setRefunds] = useState<AdminRefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRefunds = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/refund");
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Failed to load refund requests."
        );
        setRefunds([]);
        return;
      }

      setRefunds(Array.isArray(data.refunds) ? data.refunds : []);
    } catch {
      setError("Network error. Please try again.");
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Refund Requests – Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Latest refund decisions for support review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void loadRefunds()}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Refresh
            </button>
            <Link
              href="/"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Back to Refund Form
            </Link>
          </div>
        </div>

        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-sm text-slate-600">Loading refund requests…</p>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {!loading && !error && refunds.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <p className="text-base font-medium text-slate-900">
              No refund requests yet
            </p>
            <p className="mt-2 text-sm text-slate-600">
              When customers submit requests, they will appear here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
            >
              Go to customer refund form
            </Link>
          </div>
        )}

        {!loading && !error && refunds.length > 0 && (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                    <tr>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Decision</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">AI Reasoning</th>
                      <th className="px-4 py-3">Policy Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {refunds.map((refund) => (
                      <tr key={refund.id} className="align-top hover:bg-slate-50/80">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                          {formatDateTime(refund.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">
                            {refund.customerName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {refund.customerEmail}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-800">
                          {refund.orderNumber}
                        </td>
                        <td className="px-4 py-3">
                          <DecisionBadge decision={refund.decision} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                          {refund.requestedAmount != null
                            ? `$${refund.requestedAmount.toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="max-w-xs px-4 py-3 text-slate-700">
                          <ExpandableText text={refund.reasoning} />
                        </td>
                        <td className="max-w-xs px-4 py-3 text-slate-500">
                          {refund.policyNotes ? (
                            <ExpandableText
                              text={refund.policyNotes}
                              previewLength={80}
                              muted
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="space-y-4 md:hidden">
              {refunds.map((refund) => (
                <article
                  key={refund.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">
                        {refund.customerName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {refund.customerEmail}
                      </p>
                    </div>
                    <DecisionBadge decision={refund.decision} />
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-xs text-slate-500">Date</dt>
                      <dd className="text-slate-800">
                        {formatDateTime(refund.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Order</dt>
                      <dd className="font-mono text-xs text-slate-800">
                        {refund.orderNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Amount</dt>
                      <dd className="text-slate-800">
                        {refund.requestedAmount != null
                          ? `$${refund.requestedAmount.toFixed(2)}`
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Reason</dt>
                      <dd className="text-slate-800">{refund.reason}</dd>
                    </div>
                  </dl>

                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-700">
                      AI Reasoning
                    </p>
                    <ExpandableText text={refund.reasoning} />
                  </div>

                  {refund.policyNotes && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-slate-700">
                        Policy Notes
                      </p>
                      <ExpandableText
                        text={refund.policyNotes}
                        previewLength={100}
                        muted
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function DecisionBadge({ decision }: { decision: RefundDecision }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${DECISION_STYLES[decision]}`}
    >
      {decision}
    </span>
  );
}

function ExpandableText({
  text,
  previewLength = 120,
  muted = false,
}: {
  text: string;
  previewLength?: number;
  muted?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncate = text.length > previewLength;
  const shown =
    !needsTruncate || expanded ? text : `${text.slice(0, previewLength).trim()}…`;

  return (
    <div>
      <p
        className={`whitespace-pre-wrap text-xs leading-relaxed ${
          muted ? "text-slate-500" : "text-slate-700"
        }`}
      >
        {shown}
      </p>
      {needsTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
