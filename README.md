# Mays Method Lab

AI-powered tools for academic leaders at Mays Business School, Texas A&M University.

This repo hosts the **platform shell** — the website, navigation, design system, and authentication — and the individual **apps** that plug into it.

The first app is the [Evaluation Letter Writer](src/app/admin/evaluation-letters), which generates annual faculty evaluation letters from a self-evaluation, CV, and writer notes.

---

## Stack

- **Next.js 14 (App Router) + React + TypeScript**
- **Tailwind CSS** — custom dark TAMU theme (Aggie Maroon `#500000`)
- **Anthropic Claude API** — `claude-sonnet-4-20250514` for the evaluation pipeline
- **Auth (v1)** — shared password gate; replaceable with TAMU CAS SSO
- **Deploy** — Render (see [render.yaml](render.yaml))

---

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

The site runs at <http://localhost:3000>.

### Environment variables

| Variable           | Purpose                                                                  |
|--------------------|--------------------------------------------------------------------------|
| `ANTHROPIC_API_KEY`| Claude API key. Used by the Evaluation Letter Writer.                    |
| `ADMIN_PASSWORD`   | Shared password for the v1 admin gate.                                   |
| `SESSION_SECRET`   | Optional — HMAC secret for session cookies. Falls back to `ADMIN_PASSWORD`. |

A `.env.local` with placeholder values is included to keep local dev running; the AI features won't return real output until `ANTHROPIC_API_KEY` is set to a real key.

---

## Pages

| Route                          | Purpose                                                              |
|--------------------------------|----------------------------------------------------------------------|
| `/`                            | Cinematic landing page (hero, mission, vision, leadership).          |
| `/about`                       | About the Lab and the co-directors.                                  |
| `/login`                       | Shared password gate (placeholder for TAMU CAS SSO).                 |
| `/admin`                       | Admin Tools card grid. Auth-required.                                |
| `/admin/evaluation-letters`    | Evaluation Letter Writer host page (filled in by Prompt 2).          |

---

## Adding a new admin tool

The Admin Tools page renders from a registry — no other code needs to change to surface a new tool:

```ts
// src/lib/tools.ts
export const ADMIN_TOOLS: ToolCardProps[] = [
  { title: '…', description: '…', href: '/admin/your-tool', status: 'live' },
];
```

Then build the route under `src/app/admin/your-tool/`.

---

## Deploying to Render

1. Push this repo to GitHub.
2. In Render, **New &rarr; Blueprint**, select this repo. Render reads `render.yaml`.
3. In the service settings, fill in:
   - `ANTHROPIC_API_KEY`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET` (optional but recommended)

Render will build and start the service.

---

## Phase 2 (future, not built)

- PostgreSQL or Supabase for faculty rosters, historical letters, archives
- TAMU CAS SSO replacing the shared-password gate
- Per-department letterhead templates
- Multi-department dashboard for the Senior Associate Dean
- Staff evaluation app (separate workflow)
