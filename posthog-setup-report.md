<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the EduGap quiz application. PostHog is now initialized via `instrumentation-client.ts` (Next.js 15.3+ pattern) and proxied through a `/ingest` reverse proxy configured in `next.config.ts`. All existing Vercel Analytics events are now dual-tracked in PostHog through an updated `lib/analytics.ts` helper. Four new events exclusive to PostHog were added directly in `app/page.tsx` to capture granular per-question interactions that were not previously tracked anywhere.

LLM observability has also been added for Google Gemini via OpenTelemetry auto-instrumentation. `instrumentation.ts` initialises a `NodeSDK` with `PostHogSpanProcessor` and `GenAIInstrumentation` — any call to `getGeminiClient()` (from the new `lib/gemini.ts` helper) will automatically emit `$ai_generation` events to PostHog with model name, latency, input/output tokens, and estimated cost, with no per-call instrumentation code required.

| Event | Description | File |
|---|---|---|
| `quiz_started` | User submits pre-quiz survey and begins answering questions | `app/page.tsx` via `lib/analytics.ts` |
| `pre_quiz_submitted` | User submits the pre-quiz self-assessment with star rating and comment | `app/page.tsx` via `lib/analytics.ts` |
| `question_answered` | User selects an MCQ option — tracks `question_id`, `question_index`, `is_correct`, `selected_option` | `app/page.tsx` (PostHog only) |
| `essay_submitted` | User submits a short-answer essay response — tracks `answer_length` | `app/page.tsx` (PostHog only) |
| `essay_graded` | User self-grades their essay as correct or incorrect — tracks `checked_points_count` | `app/page.tsx` (PostHog only) |
| `quiz_completed` | User finishes all questions — tracks `score_percent`, `correct_count` | `app/page.tsx` via `lib/analytics.ts` |
| `quiz_restarted` | User clicks restart to redo the current quiz set | `app/page.tsx` (PostHog only) |
| `post_quiz_submitted` | User submits post-quiz survey with understanding, utility, and personalized ratings | `app/page.tsx` via `lib/analytics.ts` |
| `waitlist_submitted` | User registers their email on the waitlist from the results screen | `app/page.tsx` via `lib/analytics.ts` |
| `share_link_copied` | User copies the quiz set share link | `app/page.tsx` via `lib/analytics.ts` |
| `quiz_set_changed` | User navigates to a different quiz set | `app/page.tsx` via `lib/analytics.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](https://us.posthog.com/project/451168/dashboard/1659083)
- [Quiz Completion Funnel](https://us.posthog.com/project/451168/insights/vbii7WgL) — drop-off between quiz start and completion
- [Daily Active Learners](https://us.posthog.com/project/451168/insights/mlJ4ceBd) — unique users starting quizzes each day
- [Waitlist Conversion Funnel](https://us.posthog.com/project/451168/insights/5J7Qx93E) — how many completers sign up for the waitlist
- [Question Answered Over Time](https://us.posthog.com/project/451168/insights/AM2k3NhW) — daily MCQ answers and essay submissions
- [Full Learning Journey Funnel](https://us.posthog.com/project/451168/insights/RH6nsGT4) — end-to-end: pre-survey → start → complete → post-survey
- [LLM Generations per Day](https://us.posthog.com/project/451168/insights/6k5fjZ7s) — total Gemini API calls per day
- [LLM Token Usage per Day](https://us.posthog.com/project/451168/insights/7L74rdCP) — daily input and output token sums

To explore LLM traces directly, visit [AI Observability → Generations](https://us.posthog.com/project/451168/ai-observability/generations).

Add `GOOGLE_AI_API_KEY` to your `.env.local` (placeholder is already present) before making live Gemini calls.

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
