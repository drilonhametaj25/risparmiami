declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, string | number>) => void;
    };
  }
}

export function trackEvent(eventName: string, data?: Record<string, string | number>) {
  if (typeof window !== "undefined" && window.umami) {
    window.umami.track(eventName, data);
  }
}
