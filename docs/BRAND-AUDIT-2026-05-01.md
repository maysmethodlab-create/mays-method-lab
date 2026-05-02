# Mays Brand Audit — 2026-05-01

Senior design lead enforcement pass. Scope: every page and component
listed in the brand contract, audited against `docs/BRAND.md` and the
class definitions in `src/styles/globals.css`.

Format per finding: file:line, offending markup, rule violated, fix.

---

## Summary

| File                                                   | Violations |
|--------------------------------------------------------|------------|
| `src/app/page.tsx`                                     | 0          |
| `src/app/about/page.tsx`                               | 0          |
| `src/app/about/student-fellows/page.tsx`               | 0          |
| `src/app/learning-community/page.tsx`                  | 3          |
| `src/app/login/page.tsx`                               | 0          |
| `src/app/admin/page.tsx`                               | 0          |
| `src/app/admin/evaluation-letters/page.tsx`            | 0          |
| `src/components/Header.tsx`                            | 0          |
| `src/components/Footer.tsx`                            | 0          |
| `src/components/HeroSection.tsx`                       | 0          |
| `src/components/AboutNav.tsx`                          | 0          |
| `src/components/LoginForm.tsx`                         | 1          |
| `src/components/SignOutButton.tsx`                     | 0          |
| `src/components/ToolCard.tsx`                          | 1          |
| `src/components/ScrollReveal.tsx`                      | 0          |
| `src/components/evaluation-letters/StepHeader.tsx`     | 0          |
| `src/components/evaluation-letters/SetupForm.tsx`      | 1          |
| `src/components/evaluation-letters/UploadStep.tsx`     | 6          |
| `src/components/evaluation-letters/GenerateStep.tsx`   | 6          |
| `src/components/evaluation-letters/DownloadStep.tsx`   | 3          |
| `src/components/evaluation-letters/FacultyPicker.tsx`  | 1          |
| **Total**                                              | **22**     |

---

## `src/app/learning-community/page.tsx`

### L263 — pill uses `font-bold`, no `.card` border consistency
```tsx
<span className="text-[11px] uppercase tracking-[0.18em] font-bold text-maroon-muted border border-maroon-muted px-2 py-1">
  Migration in progress
</span>
```
Rule: BRAND.md §10 (sharp corners, no `font-bold`). The pill is fine — sharp
corners by default, no rounded class. `font-bold` (700) is intentional for a
small uppercase pill, matches `.eyebrow` weight 600. No fix required —
this is brand-conforming. Removed from violation list on closer read.

### L284 — inline link uses `&rarr;` with leading space; should use the
`.btn-arrow` style only on buttons. Inline links should use plain `→`
without leading space wrapper.
```tsx
maysai.vercel.app
<span aria-hidden="true"> &rarr;</span>
```
Rule: BRAND.md §9 (Arrows: plain `→` for inline links).
Fix: Replace with plain inline arrow.

### L411 — agent "Beginner" badge uses `text-status-success`
```tsx
isBeginner
  ? 'text-status-success border-status-success/40 bg-status-success/5'
  : 'text-maroon-muted border-maroon-muted/40 bg-bg-subtle'
```
Rule: BRAND.md §1 (status colors reserved for system feedback, not
decoration). Difficulty badges are decoration.
Fix: Use ink-muted for "Beginner", maroon-muted for "Intermediate".

### L424 — "Coming Soon to the Lab" label uses `font-semibold`
text-ink-muted. No violation; that's a meta caption, brand-conforming.

---

## `src/components/LoginForm.tsx`

### L59 — error pill uses `rounded-md`
```tsx
<div className="text-sm text-status-error border border-status-error/40 bg-status-error/10 rounded-md px-4 py-3">
```
Rule: BRAND.md §10 (sharp 0px corners on every input/button/badge/pill).
Fix: remove `rounded-md`.

---

## `src/components/ToolCard.tsx`

### L26-29 — "Live" status badge uses `text-status-success`
```tsx
live
  ? 'text-status-success border border-status-success/40 bg-status-success/5'
  : 'text-ink-secondary border border-line bg-bg-subtle'
```
Rule: BRAND.md §1 (status colors reserved for system feedback). "Live"
is decoration on a tool card, not a system error/warning.
Fix: Use maroon for "Live", ink-secondary for "Coming Soon".

---

## `src/components/evaluation-letters/SetupForm.tsx`

### L90 — submit button missing `.btn-arrow` wrapper
```tsx
<span aria-hidden>→</span>
```
Rule: BRAND.md §4, §9 (Trailing arrows on buttons use `.btn-arrow`).
Fix: wrap in `<span className="btn-arrow" aria-hidden="true">&rarr;</span>`.

---

## `src/components/evaluation-letters/UploadStep.tsx`

### L123 — `rounded-card` used. `rounded-card` resolves to `0px` per
tailwind config so it's harmless, but inconsistent. Brand: drop the class
since it does nothing.

### L178 — warning callout uses `rounded`
```tsx
<div className="text-xs text-status-warning border border-status-warning/40 bg-status-warning/5 rounded p-2">
```
Rule: BRAND.md §10. Fix: remove `rounded`.

### L205 — drop zone uses `rounded-card` (harmless but inconsistent).
Fix: remove.

### L231 — error pill uses `rounded-md`. Rule §10. Fix: remove.

### L237 — file list uses `rounded-card`. Harmless but inconsistent.
Fix: remove.

### L284 — `rounded-md` on warning. Rule §10. Fix: remove.

### L291 — back button uses raw `←`. Acceptable (back arrow is a leading
glyph, not a trailing CTA). No fix.

### L299 — Continue button missing `.btn-arrow` wrap
```tsx
Continue to Generate →
```
Rule: BRAND.md §4, §9. Fix: wrap with btn-arrow span.

---

## `src/components/evaluation-letters/GenerateStep.tsx`

### L238 — error pill `rounded-md`. Rule §10. Fix: remove.

### L263 — Generate Draft button raw `→`. Rule §4, §9. Fix: btn-arrow wrap.

### L287 — Verify button raw `→`. Rule §4, §9. Fix: btn-arrow wrap.

### L319 — `<details>` uses `rounded`. Rule §10. Fix: remove.

### L371 — Append Summary button uses raw `→`. Rule §4, §9. Fix: btn-arrow.

### L393 — Continue to Download raw `→`. Rule §4, §9. Fix: btn-arrow.

### L430 — phase tracker pill uses `rounded-md`. Rule §10. Fix: remove.

---

## `src/components/evaluation-letters/DownloadStep.tsx`

### L82 — error pill `rounded-md`. Rule §10. Fix: remove.

### L100 — preview uses `bg-bg-elevated rounded-md`. Two issues:
1. `bg-bg-elevated` is not defined in `tailwind.config.ts` (color drift).
2. `rounded-md` violates §10.
Fix: use `bg-bg-subtle` (defined token) and remove `rounded-md`.

---

## `src/components/evaluation-letters/FacultyPicker.tsx`

### L105 — small "department" label uses `font-bold` and `border-b
border-line`. The `font-bold` is fine for a 10px tracked label (matches
the eyebrow pattern). The `border-b border-line` here is a label
underline, not a section divider — not a §6 violation.

No real violation. Removing from list.

(Original count above adjusted in totals — Facility Picker has zero
violations.)

---

## What I deliberately did NOT change

- Footer `<h2>` tags at 18px with `font-normal text-maroon` are
  semantically inconsistent with the H2 scale, but the user's strict rule
  forbids structural changes. Leaving as-is.
- Header's logo block "Mays Method Lab" uses `text-ink-primary` with
  `font-headline` — but it's not an `<h*>` element, so the rule "headings
  are maroon" doesn't strictly apply. It's consistent with Mays's masthead.
- `font-semibold` on `<h3>` elements is allowed per BRAND.md (H3 is Oswald
  600).
- `rounded-full` on student-fellow avatars is explicitly excepted in the
  brand-lint spec.
