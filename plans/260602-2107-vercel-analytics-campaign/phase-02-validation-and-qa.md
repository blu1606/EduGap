# Phase 02: Validation And QA

## Context Links

- Overview: [plan.md](plan.md)
- Implementation phase: [phase-01-vercel-custom-events.md](phase-01-vercel-custom-events.md)

## Overview

Priority: High  
Status: planned  
Goal: prove analytics instrumentation does not break the quiz, does not leak sensitive fields, and stays within Vercel Hobby constraints.

## Requirements

### Functional

- Run compile/build checks after implementation.
- Exercise real quiz UI interactions in browser if possible.
- Confirm event calls are reachable from user actions.
- Confirm no raw PII is sent.
- Confirm no high-volume Phase 1 events exist.

### Non-Functional

- Do not fake analytics success by only checking imports.
- Do not ignore failed build/lint errors.
- Keep validation concise.

## Validation Steps

1. Run `pnpm build`.
2. If build passes, run `pnpm lint` if lint is reasonably fast and configured.
3. Start dev server with `pnpm dev`.
4. Open app in browser.
5. Test golden path:
   - Load default set.
   - Submit pre-survey.
   - Answer through quiz.
   - Finish quiz.
   - Submit post-survey.
   - Submit waitlist email.
   - Copy share link.
   - Switch quiz set.
6. Test edge cases:
   - Invalid waitlist email should not track `waitlist_submitted`.
   - Re-click answered MCQ should not create any answer-level event because answer events are deferred.
   - Question fetch failure path should track failure without crashing.

## Hobby Quota QA Checklist

- [ ] No `timestamp` property is injected by helper.
- [ ] No `question_viewed` event in Phase 1.
- [ ] No `quiz_answer_selected` event in Phase 1.
- [ ] No keyboard/topic/mobile engagement events in Phase 1.
- [ ] Each event has about 3-5 custom properties.
- [ ] `set_title` is not sent by default; `set_id` is enough.

## Privacy QA Checklist

Search implemented code for accidental property names:

- [ ] No `email` value sent to `trackQuizEvent`.
- [ ] No `comment` value sent to `trackQuizEvent`.
- [ ] No `essayInput` value sent to `trackQuizEvent`.
- [ ] No `currentQuestion.answer` sent as `correct_option`.
- [ ] No manually collected IP/user-agent sent.

## Event QA Checklist

- [ ] `pre_quiz_submitted` fires after rating exists.
- [ ] `quiz_started` fires with pre-survey submit.
- [ ] `quiz_completed` tracks score summary.
- [ ] `post_quiz_submitted` tracks ratings and `has_comment` only.
- [ ] `waitlist_submitted` tracks `has_email: true` only.
- [ ] `share_link_copied` tracks source.
- [ ] `quiz_set_changed` tracks from/to set IDs.
- [ ] `quiz_questions_load_failed` tracks fetch failure.

## Related Code Files

- `app/page.tsx`
- `lib/analytics.ts`

## Todo List

- [ ] Build app.
- [ ] Lint app if applicable.
- [ ] Browser-test quiz golden path.
- [ ] Browser-test edge cases.
- [ ] Review analytics payload privacy.
- [ ] Review Hobby quota discipline.

## Success Criteria

- Build succeeds.
- User-facing quiz flow still works.
- No sensitive values appear in analytics payload code.
- No high-volume events appear in Phase 1 implementation.
- Any remaining limitations are stated clearly before shipping.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Vercel dashboard delayed | validate code path and network calls locally; note dashboard delay |
| Dev environment cannot browser-test | state explicitly and rely on build + code inspection |
| Lint noisy from existing code | report existing issue separately; do not weaken analytics implementation |
| Hobby quota exceeded | keep events funnel-level only |

## Security Considerations

Analytics validation must include payload review. Treat telemetry payload as externally visible.

## Next Steps

If MVP data is insufficient after a usage cycle, evaluate Phase 03.

## Unresolved Questions

- None.
