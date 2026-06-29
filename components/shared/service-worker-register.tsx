"use client";

import { useEffect } from "react";

/**
 * Registers the application-shell service worker (JIKU-9). Mounted once in the
 * root layout. Registration is limited to production builds so the service worker
 * never interferes with the dev server's hot-reload during development.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    if (!("serviceWorker" in navigator)) {
      return;
    }
    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error) => {
          console.error("Service worker registration failed", error);
        });
    };
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
