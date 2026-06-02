---
status: planned
created: 2026-06-02
updated: 2026-06-02
owner: blu1606
scope: vercel-analytics-campaign
blockedBy: []
blocks: []
---

# Vercel Analytics Campaign Plan

## Overview

Implement a privacy-safe analytics campaign for the quiz app using existing Vercel Analytics first. Scope is optimized for Vercel Hobby limits: low event volume, few custom properties per event, no raw PII, no essay/comment content.

## Recommendation

Use `@vercel/analytics` custom events now because dependency and `<Analytics />` are already present. Add a small `lib/analytics.ts` helper, then instrument only high-value funnel handlers in `app/page.tsx`.

## Hobby Plan Constraints

| Constraint | Impact |
|---|---|
| ~50,000 total events/month | Avoid per-question view tracking and noisy engagement events |
| Short data retention | Use Vercel for recent campaign signal, not long-term warehouse analysis |
| Tight custom property limits | Keep each event to about 3-5 flat primitive properties |
| 255-char key/value/name limit | Use short snake_case names and IDs, not long text |
| Tracking can pause after quota | App should continue working because analytics must not block UI |

## Phases

| Phase | Status | File | Goal |
|---|---|---|---|
| 01 | planned | [phase-01-vercel-custom-events.md](phase-01-vercel-custom-events.md) | Add Vercel event helper and lean Hobby-safe funnel events |
| 02 | planned | [phase-02-validation-and-qa.md](phase-02-validation-and-qa.md) | Validate build, interaction flow, event privacy, quota discipline |
| 03 | future | [phase-03-advanced-analytics-options.md](phase-03-advanced-analytics-options.md) | Define Supabase/PostHog expansion path only if needed |

## Target Files

- Modify: `app/page.tsx`
- Create: `lib/analytics.ts`
- Existing verified: `app/layout.tsx` already includes `<Analytics />`
- Existing verified: `package.json` already includes `@vercel/analytics`

## Hobby-Safe MVP Event Priority

1. `quiz_started`
2. `quiz_completed`
3. `pre_quiz_submitted`
4. `post_quiz_submitted`
5. `waitlist_submitted`
6. `share_link_copied`
7. `quiz_set_changed`
8. `quiz_questions_load_failed`

Do not include `question_viewed` in Phase 1. Only add per-answer events if quota pressure is acceptable or behind a temporary campaign window.

## Property Budget

Keep each event to 3-5 properties. Prefer:

- `set_id`
- `difficulty`
- `question_count`
- `score_percent`
- `has_comment`
- `has_email`

Avoid repeated `set_title`, `question_index`, `total_questions` on every event unless needed. `set_id` is enough for joining against manifest data.

## Privacy Rules

Never send raw email, essay content, survey comments, IP, or personally identifying data to Vercel Analytics. Send booleans/counts only: `has_email`, `has_comment`, `answer_length`, `is_correct`, `score_percent`.

## Success Criteria

- Build passes with no TypeScript errors.
- MVP events fire from real UI interactions.
- Event properties contain only compact quiz metadata and no raw PII.
- No `timestamp` custom property is added; Vercel records event time itself.
- Analytics code is centralized enough to avoid repeated `track()` imports across handlers.

## Implementation Handoff

Run:

```bash
/cook D:\CODE\AITHUCCHIEN\LABS\quiz-web-application\plans\260602-2107-vercel-analytics-campaign
```

## Unresolved Questions

- Should `quiz_answer_selected` be enabled in Phase 1 despite quota cost? Recommended: no on Hobby; use `quiz_completed` score first.
- Should anonymous/session IDs be added in Phase 1? Recommended: no for Vercel-only MVP; add only when Supabase event stream is implemented.
