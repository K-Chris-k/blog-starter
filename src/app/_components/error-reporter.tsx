"use client";

import { useEffect } from "react";

/** 收集当前浏览器环境信息 */
function getClientContext() {
  return {
    url: window.location.href,
    pagePath: window.location.pathname,
    referer: document.referrer || undefined,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
}

function reportError(data: {
  message: string;
  stack?: string;
  level?: string;
  metadata?: Record<string, unknown>;
}) {
  const context = getClientContext();

  fetch("/api/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, ...context }),
  }).catch(() => {
    /* silently fail to avoid infinite error loops */
  });
}

export function ErrorReporter() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      reportError({
        message: event.message,
        stack: event.error?.stack,
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      reportError({
        message:
          reason instanceof Error
            ? reason.message
            : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        metadata: { type: "unhandledrejection" },
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}
