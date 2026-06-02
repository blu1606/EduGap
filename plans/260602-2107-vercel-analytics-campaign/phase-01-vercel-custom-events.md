# Phase 01: Vercel Custom Events

## Context Links

- Overview: [plan.md](plan.md)
- Main app: `app/page.tsx`
- Analytics provider: `app/layout.tsx`
- Dependency: `package.json`

## Overview

Priority: High  
Status: planned  
Goal: instrument the quiz funnel with Vercel Analytics custom events while staying safe for Vercel Hobby limits.

## Key Insight

Vercel Hobby can track custom events, but quota/property limits are tight. Phase 1 must avoid noisy per-question/per-render telemetry and keep properties compact.

## Requirements

### Functional

- Create `lib/analytics.ts` with a `trackQuizEvent(eventName, properties)` helper.
- Import the helper in `app/page.tsx`.
- Track lean MVP funnel events inside existing handlers.
- Do not change quiz behavior or Supabase survey behavior.

### Non-Functional

- Keep helper tiny and client-safe.
- Do not add a custom `timestamp` property; Vercel records event time.
- Avoid raw PII and free-text fields.
- Use stable snake_case event/property names.
- Keep each event payload to about 3-5 flat primitive properties.
- Do not add new dependencies.

## Event Taxonomy

### Phase 1 Hobby-Safe Events

- `quiz_started`
- `quiz_completed`
- `pre_quiz_submitted`
- `post_quiz_submitted`
- `waitlist_submitted`
- `share_link_copied`
- `quiz_set_changed`
- `quiz_questions_load_failed`

### Deferred Due Quota Cost

- `question_viewed`
- `quiz_answer_selected`
- `essay_submitted`
- `essay_self_graded`
- `question_next_clicked`
- `evaluation_point_toggled`
- `keyboard_shortcut_used`
- `topic_expanded`
- `mobile_menu_opened`
- `api_json_opened`

Add these only after reviewing real quota consumption or moving deeper analytics to Supabase/PostHog.

## Architecture

### Helper

`lib/analytics.ts`:

```ts
import { track } from '@vercel/analytics';

type QuizEventProperties = Record<string, string | number | boolean | null | undefined>;

export function trackQuizEvent(eventName: string, properties: QuizEventProperties = {}) {
  track(eventName, properties);
}
```

Do not add `timestamp`; it wastes a custom property slot and Vercel already records event time.

### Compact Property Builder

Use a small local helper in `app/page.tsx` after derived `activeSet` values:

```ts
const getCompactQuizAnalyticsProperties = () => ({
  set_id: activeSetId,
  difficulty: activeSet.difficulty || null,
  question_count: totalQuestions,
});
```

Do not include `set_title` by default; `set_id` can map back to manifest.

## Handler Placement

| Location | Event | Property Budget |
|---|---|---|
| `handlePreQuizSubmit` after rating validation | `pre_quiz_submitted` | `set_id`, `difficulty`, `rating_pre`, `has_comment` |
| same action | `quiz_started` | `set_id`, `difficulty`, `question_count` |
| `handleNextQuestion` last question branch | `quiz_completed` | `set_id`, `difficulty`, `question_count`, `score_percent`, `correct_count` |
| `handlePostQuizSubmit` after ratings validation | `post_quiz_submitted` | `set_id`, `understanding`, `utility`, `personalized`, `has_comment` |
| `handleWaitlistSubmit` after email validation | `waitlist_submitted` | `set_id`, `has_email` |
| `handleSetChange` | `quiz_set_changed` | `from_set_id`, `to_set_id` |
| Share copy handlers | `share_link_copied` | `set_id`, `source` |
| question fetch catch or non-ok response | `quiz_questions_load_failed` | `set_id`, `parent_id` |

## Privacy Details

Do not track:

- `waitlistEmail`
- `essayInput`
- `comment_pre`
- `comment_post`
- `currentQuestion.answer` as `correct_option`
- long question/set titles

Allowed derived values:

- `has_email`
- `has_comment`
- `rating_pre`
- post-survey numeric ratings
- `correct_count`
- `score_percent`
- `question_count`

## Implementation Steps

1. Create `lib/analytics.ts` with `trackQuizEvent` and no timestamp injection.
2. Import `trackQuizEvent` in `app/page.tsx`.
3. Add local compact property helper after derived `activeSet/currentQuestion` values.
4. Add `pre_quiz_submitted` and `quiz_started` after rating validation in `handlePreQuizSubmit`.
5. Add `quiz_completed` in final branch of `handleNextQuestion`.
6. Add `post_quiz_submitted` and `waitlist_submitted` after validation in submit handlers.
7. Add `quiz_set_changed` and `share_link_copied` events.
8. Add `quiz_questions_load_failed` for fetch catch and non-ok response.
9. Do not implement `question_viewed` or per-answer events in Phase 1.

## Todo List

- [ ] Add analytics helper.
- [ ] Instrument lean funnel submit/completion handlers.
- [ ] Instrument set/share/load failure events.
- [ ] Verify each event has 3-5 properties max.
- [ ] Verify no raw PII is tracked.

## Success Criteria

- Vercel events compile through TypeScript.
- No behavior regression in quiz navigation, surveys, or sharing.
- All tracked properties are flat primitives accepted by Vercel Analytics.
- No Phase 1 event fires per question render or per keyboard shortcut.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Burning Hobby quota | avoid `question_viewed`, answer events, keyboard events in Phase 1 |
| Properties dropped by Vercel | keep properties compact, avoid `set_title`, avoid timestamp |
| PII leakage | never pass email/comment/essay text |
| Handler stale closures | keep helper stateless; use current derived values only |

## Security Considerations

Analytics is third-party telemetry. Treat payload as public-ish. Do not send user content or identifiers unless future consent flow exists.

## Next Steps

Proceed to Phase 02 validation after implementation.

## Unresolved Questions

- Is answer-level accuracy required immediately? If yes, use Supabase event stream instead of Vercel Hobby for that detail.
