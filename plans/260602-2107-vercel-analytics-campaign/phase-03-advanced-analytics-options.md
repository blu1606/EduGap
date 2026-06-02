# Phase 03: Advanced Analytics Options

## Context Links

- Overview: [plan.md](plan.md)
- Vercel MVP: [phase-01-vercel-custom-events.md](phase-01-vercel-custom-events.md)
- Validation: [phase-02-validation-and-qa.md](phase-02-validation-and-qa.md)

## Overview

Priority: Future  
Status: future  
Goal: define when to add stronger analytics tools after Vercel custom events prove useful or insufficient.

## Tool Decision Matrix

| Need | Tool | When to choose |
|---|---|---|
| Simple event analytics | Vercel Analytics | Current Phase 1 MVP |
| SQL/product event stream | Supabase `analytics_events` | Need question/set/drop-off queries |
| Retention/cohort/journey/replay | PostHog | Need product analytics beyond SQL |
| Open-source self-host analytics | Umami | Need privacy-friendly page/event analytics |
| Heatmap/session replay | PostHog or Microsoft Clarity | Need UX observation, with consent/privacy review |

## Supabase Event Stream Option

Create separate table, not mixed with existing `surveys` table.

Suggested schema:

```sql
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  anonymous_id text,
  session_id text,
  set_id text,
  question_id text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

Use for SQL questions:

- Which set is studied most?
- Which question has highest wrong-answer rate?
- Where do learners drop off?
- What is pre-survey to completion to waitlist conversion?
- How long does completion take per set/session?

## Anonymous Identity Option

Only add if Supabase/PostHog journey analysis is needed.

- `anonymous_id`: UUID in localStorage.
- `session_id`: UUID in sessionStorage.
- Do not connect to email unless explicit consent and clear reason exist.

## Survey Data Separation

Keep existing `surveys` table for:

- pre rating
- post ratings
- comments
- waitlist email

Keep behavior analytics separate for:

- clicks
- answers
- views
- completion
- sharing
- drop-off

## Implementation Trigger

Move beyond Vercel only if at least one need becomes real:

- Vercel dashboard cannot answer drop-off by question.
- Need SQL analysis for wrong-answer rates.
- Need cohort/retention after multiple sessions.
- Need journey/replay to debug confusing UI behavior.

## Todo List

- [ ] Review Vercel Analytics data after MVP usage.
- [ ] List unanswered business/product questions.
- [ ] Choose Supabase event stream or PostHog based on real gap.
- [ ] Add consent/privacy copy if identity/session replay is introduced.

## Success Criteria

- No new tool is added without a concrete question Vercel cannot answer.
- Survey lead data remains separate from raw behavior events.
- Any identity/session tracking has explicit privacy review.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Over-instrumentation | wait for actual unanswered questions |
| PII mixing | separate analytics table from survey table |
| Consent issues | avoid replay/identity until consent copy exists |

## Security Considerations

Session replay and journey analytics can capture sensitive behavior. Require consent/privacy review before enabling PostHog replay or Microsoft Clarity.

## Next Steps

Stay on Vercel Analytics for Phase 1 unless deeper queries become necessary.

## Unresolved Questions

- Which product questions remain unanswered after one usage cycle?
