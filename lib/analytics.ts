import { track } from '@vercel/analytics';
import posthog from 'posthog-js';

type QuizEventProperties = Record<string, string | number | boolean | null | undefined>;

export function trackQuizEvent(eventName: string, properties: QuizEventProperties = {}) {
  track(eventName, properties);
  posthog.capture(eventName, properties);
}
