"use client";

import { useEffect } from "react";

/**
 * Notifies the embedding parent iframe of the page height (JIKU-92). The embed
 * script checks the message origin before resizing, so only the intended host can
 * use it; the page never exposes data through these messages, only its height.
 */
export function WidgetResizer() {
  useEffect(() => {
    let stopped = false;

    const send = () => {
      if (stopped) return;
      const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.parent?.postMessage({ type: "jiku-widget:height", height }, "*");
    };

    send();
    const interval = window.setInterval(send, 400);
    const observer = new ResizeObserver(send);
    observer.observe(document.body);
    window.addEventListener("load", send);

    return () => {
      stopped = true;
      window.clearInterval(interval);
      observer.disconnect();
      window.removeEventListener("load", send);
    };
  }, []);

  return null;
}
