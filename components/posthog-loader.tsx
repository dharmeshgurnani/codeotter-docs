'use client';
import { useEffect } from 'react';

// Public, ingest-only project key: the same one codeotter.io serves in its page source.
const KEY = 'phc_xA637Y7FFaaS6LnxA86fvPGjig7sWvJfmQ5LbsiMCXHJ';

const EVENTS = ['scroll', 'click', 'keydown', 'pointerdown', 'touchstart'];

export function PostHogLoader() {
  useEffect(() => {
    // Only the production docs host reports: `next dev`, previews and workers.dev stay silent.
    if (window.location.hostname !== 'docs.codeotter.io') return;

    let started = false;
    let idleId: number | undefined;
    let timerId: number | undefined;

    function stop() {
      EVENTS.forEach((type) => window.removeEventListener(type, start, true));
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      window.clearTimeout(timerId);
    }

    // Load posthog-js on the first interaction, or when the browser is idle (3 s at most),
    // so it stays out of the initial JS and off the critical path.
    async function start() {
      if (started) return;
      started = true;
      stop();
      const { default: posthog } = await import('posthog-js');
      if (posthog.__loaded) return;
      posthog.init(KEY, {
        api_host: 'https://p.codeotter.io',
        defaults: '2025-05-24',
        person_profiles: 'identified_only',
        disable_session_recording: true,
        // Docs is a single-page app: report the landing page and every client-side navigation.
        capture_pageview: 'history_change',
      });
    }

    EVENTS.forEach((type) =>
      window.addEventListener(type, start, { capture: true, passive: true }),
    );
    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(start, { timeout: 3000 });
    } else {
      timerId = window.setTimeout(start, 3000);
    }

    return stop;
  }, []);

  return null;
}
