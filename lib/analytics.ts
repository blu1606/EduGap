import { track } from '@vercel/analytics';

type QuizEventProperties = Record<string, string | number | boolean | null | undefined>;

export function trackQuizEvent(eventName: string, properties: QuizEventProperties = {}) {
  track(eventName, properties);
}
