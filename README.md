# WORKNOON AI-Powered Customer Support Refund System

## Overview

This application is an AI-assisted customer support tool for processing e-commerce refund requests. Customers submit a refund request through a simple web form and receive an instant decision (**Approved**, **Denied**, or **Escalated**). Support staff can review every request, including AI reasoning and policy notes, on an admin dashboard.

Decisions are made with a **hybrid engine**: deterministic hard rules first (safety), then OpenAI for policy-aware judgment when the case is not forced by those rules.

## Features

- Customer refund request form with instant AI decision
- Admin dashboard with full request history and reasoning
- Rule-based + AI hybrid decision engine
- Prompt injection protection
- Fully containerized with Docker

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Prisma + PostgreSQL
- OpenAI (`gpt-4o-mini`)
- Tailwind CSS
- Docker & Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- An OpenAI API key

### Setup

1. Clone the repository
2. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

3. Add your OpenAI API key to the `.env` file
4. Start the application:

   ```bash
   docker compose up --build
   ```

The app will be available at [http://localhost:3000](http://localhost:3000).

On startup the app container waits for Postgres to be healthy, runs Prisma migrations, then serves the Next.js standalone build.

### Seed sample data (optional)

With the database running (Compose up), from your host machine:

```bash
npx prisma db seed
```

This creates 15 sample customers and related orders for demos and testing.

### Useful Commands

| Action | URL / Command |
|--------|----------------|
| Customer form | [http://localhost:3000](http://localhost:3000) |
| Admin dashboard | [http://localhost:3000/admin](http://localhost:3000/admin) |
| Browse database | `npx prisma studio` |
| Stop stack | `docker compose down` |
| Local UI development | `docker compose up db -d` then `npm run dev` |

## Architecture

### Frontend (Next.js pages)

- `/` — Customer refund form (`src/app/page.tsx`) with loading/error states and a result card
- `/admin` — Support dashboard (`src/app/admin/page.tsx`) listing recent refund decisions

### API routes

- `POST /api/refund` — Validates input, loads customer/order, runs the refund engine, persists the result
- `GET /api/refund` — Returns the latest 20 refund requests for the admin dashboard

### Refund engine (hard rules + AI)

Located in `src/lib/refund-engine.ts` and `src/lib/ai-refund.ts`:

1. **Hard rules** run first (cannot be overridden by the model for Denied / forced Escalated cases)
2. If not hard-**Denied**, **OpenAI** evaluates the request against the official policy text
3. Results (decision, reasoning, policy notes) are stored on `RefundRequest`

### Database models

Prisma models (`prisma/schema.prisma`):

- **Customer** — name, unique email
- **Order** — order number, items (JSON), total, status, order date
- **RefundRequest** — reason, message, optional requested amount, decision, AI reasoning, policy notes

### How the AI is called and protected

See [AI Integration](#ai-integration) below. The OpenAI client reads `process.env.OPENAI_API_KEY`. Inside Docker Compose, that value is injected from the host `.env` / environment; `DATABASE_URL` is set to the Compose service hostname `db`.

## AI Integration

### Hybrid approach

1. **Hard rules (safety layer)**
   - Order not `delivered` → **Denied**
   - Any final-sale item on the order → **Denied**
   - Order older than **30 days** → **Denied**
   - Requested amount (or order total) **> $500** → **Escalated** (AI may add notes; cannot Approve)
2. **AI layer** — When not hard-Denied, `gpt-4o-mini` receives the full refund policy, order facts, and customer text, and must return JSON: `decision`, `reasoning`, `policyNotes`
3. **Fallback** — If OpenAI fails, returns an invalid decision, or the API key is missing → safe **Escalated**

### Prompt injection safeguards

- Strong system instructions: policy and order facts are authoritative
- Customer reason/message are treated as **untrusted** content (delimited in the prompt)
- Model is instructed to ignore attempts to override policy or change output format
- Response validated: decision must be exactly `Approved` | `Denied` | `Escalated`
- JSON mode (`response_format: { type: "json_object" }`) for structured output

The official policy lives in `src/lib/refund-policy.ts` and is passed into the AI prompt for every evaluation.

## Assumptions & Trade-offs

- **30-day window** — Orders older than 30 days are automatically denied (hard rule)
- **$500 threshold** — Amounts above $500 always escalate for human review
- **Final sale** — Any final-sale line item on the order causes a hard denial (stricter than allowing partial refunds)
- **Delivered only** — Non-delivered orders cannot be refunded via this flow
- **Model choice** — `gpt-4o-mini` balances cost and latency for an assessment demo; production may prefer a stronger model or human-in-the-loop for edge cases
- **Latest 20 on admin** — Dashboard shows the most recent 20 requests (simple pagination can be added later)
- **No auth on `/admin`** — Dashboard is open for demo purposes; production would require authentication/authorization
- **Credentials in Compose** — Demo Postgres credentials are fixed in `docker-compose.yml`; production should use secrets management
- **Prisma 6** — Pinned to Prisma 6.x for classic `schema.prisma` datasource URL support (Prisma 7 moved URL config out of the schema file)

## Project structure (high level)

```
src/
  app/
    page.tsx              # Customer form
    admin/page.tsx        # Admin dashboard
    api/refund/route.ts   # POST + GET refund API
  components/
    RefundResultCard.tsx
  lib/
    prisma.ts
    refund-policy.ts
    refund-engine.ts
    ai-refund.ts
  types/refund.ts
prisma/
  schema.prisma
  seed.ts
  migrations/
```

## License

Built as a technical assessment project for WORKNOON.
