import * as Sentry from '@sentry/node';

let initialized = false;

export function initMonitoring() {
  if (initialized) return;
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      enabled: process.env.NODE_ENV !== 'development',
    });
  }
  initialized = true;
}

export function reportError(error: unknown) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error);
  } else {
    console.error(error);
  }
}
