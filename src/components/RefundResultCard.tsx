import type { RefundDecision, RefundRequestResult } from "@/types/refund";

const DECISION_STYLES: Record<
  RefundDecision,
  { badge: string; border: string; label: string }
> = {
  Approved: {
    badge: "bg-green-100 text-green-800 ring-green-600/20",
    border: "border-green-200",
    label: "Approved",
  },
  Denied: {
    badge: "bg-red-100 text-red-800 ring-red-600/20",
    border: "border-red-200",
    label: "Denied",
  },
  Escalated: {
    badge: "bg-amber-100 text-amber-900 ring-amber-600/20",
    border: "border-amber-200",
    label: "Escalated",
  },
};

type RefundResultCardProps = {
  result: RefundRequestResult;
  onReset?: () => void;
};

/**
 * Displays the AI refund decision and supporting details after form submission.
 */
export function RefundResultCard({ result, onReset }: RefundResultCardProps) {
  const style = DECISION_STYLES[result.decision];

  return (
    <section
      className={`space-y-5 rounded-xl border bg-white p-6 shadow-sm sm:p-8 ${style.border}`}
      aria-live="polite"
    >
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Decision for {result.customerName}
        </p>
        <div className="mt-3 flex justify-center">
          <span
            className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-inset ${style.badge}`}
          >
            {style.label}
          </span>
        </div>
      </div>

      <dl className="grid gap-3 rounded-lg bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Order total</dt>
          <dd className="font-medium text-slate-900">
            ${result.orderTotal.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Order date</dt>
          <dd className="font-medium text-slate-900">
            {new Date(result.orderDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-slate-500">Request ID</dt>
          <dd className="mt-0.5 font-mono text-xs break-all text-slate-700">
            {result.refundRequestId}
          </dd>
        </div>
      </dl>

      <div>
        <h2 className="text-sm font-semibold text-slate-900">AI Reasoning</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {result.reasoning}
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900">Policy Notes</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
          {result.policyNotes}
        </p>
      </div>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Submit another request
        </button>
      )}
    </section>
  );
}
