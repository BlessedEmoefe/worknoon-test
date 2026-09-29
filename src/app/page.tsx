"use client";

import Link from "next/link";
import { FormEvent, useState, type ReactNode } from "react";
import { RefundResultCard } from "@/components/RefundResultCard";
import type { RefundRequestResult } from "@/types/refund";

const REASON_OPTIONS = [
  "Damaged item",
  "Wrong item received",
  "Defective product",
  "Changed my mind",
  "Other",
] as const;

type FormState = {
  customerEmail: string;
  orderNumber: string;
  reason: string;
  customerMessage: string;
  requestedAmount: string;
};

const INITIAL_FORM: FormState = {
  customerEmail: "",
  orderNumber: "",
  reason: "",
  customerMessage: "",
  requestedAmount: "",
};

const inputClassName =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50";

export default function Home() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RefundRequestResult | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        customerEmail: form.customerEmail.trim(),
        orderNumber: form.orderNumber.trim(),
        reason: form.reason,
        customerMessage: form.customerMessage.trim(),
      };

      if (form.requestedAmount.trim() !== "") {
        const amount = Number(form.requestedAmount);
        if (Number.isNaN(amount) || amount < 0) {
          setError("Requested amount must be a valid non-negative number.");
          setLoading(false);
          return;
        }
        payload.requestedAmount = amount;
      }

      const response = await fetch("/api/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong while submitting your request. Please try again."
        );
        return;
      }

      setResult(data as RefundRequestResult);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
    setForm(INITIAL_FORM);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 flex justify-end">
          <Link
            href="/admin"
            className="text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            Go to Admin Dashboard
          </Link>
        </div>

        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            AI-Powered Refund Request
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Submit your refund request and get an instant decision powered by
            AI.
          </p>
        </header>

        {!result ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <Field label="Customer Email" htmlFor="customerEmail" required>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                required
                autoComplete="email"
                value={form.customerEmail}
                onChange={(e) => updateField("customerEmail", e.target.value)}
                className={inputClassName}
                placeholder="you@example.com"
                disabled={loading}
              />
            </Field>

            <Field label="Order Number" htmlFor="orderNumber" required>
              <input
                id="orderNumber"
                name="orderNumber"
                type="text"
                required
                value={form.orderNumber}
                onChange={(e) => updateField("orderNumber", e.target.value)}
                className={inputClassName}
                placeholder="WN-1001"
                disabled={loading}
              />
            </Field>

            <Field label="Reason" htmlFor="reason" required>
              <select
                id="reason"
                name="reason"
                required
                value={form.reason}
                onChange={(e) => updateField("reason", e.target.value)}
                className={inputClassName}
                disabled={loading}
              >
                <option value="" disabled>
                  Select a reason
                </option>
                {REASON_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Customer Message" htmlFor="customerMessage" required>
              <textarea
                id="customerMessage"
                name="customerMessage"
                required
                rows={4}
                value={form.customerMessage}
                onChange={(e) => updateField("customerMessage", e.target.value)}
                className={`${inputClassName} resize-y`}
                placeholder="Please describe what happened with your order…"
                disabled={loading}
              />
            </Field>

            <Field
              label="Requested Amount"
              htmlFor="requestedAmount"
              hint="Optional — leave blank to use the order total"
            >
              <input
                id="requestedAmount"
                name="requestedAmount"
                type="number"
                min={0}
                step="0.01"
                value={form.requestedAmount}
                onChange={(e) => updateField("requestedAmount", e.target.value)}
                className={inputClassName}
                placeholder="0.00"
                disabled={loading}
              />
            </Field>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Spinner />
                  Analyzing your request…
                </>
              ) : (
                "Submit Refund Request"
              )}
            </button>
          </form>
        ) : (
          <RefundResultCard result={result} onReset={handleReset} />
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          <Link
            href="/admin"
            className="font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            Go to Admin Dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
