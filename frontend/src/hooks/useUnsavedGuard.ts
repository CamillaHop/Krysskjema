import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Warns the user when they try to navigate away (in-app or browser close/refresh)
 * while there are unsaved changes.
 */
export function useUnsavedGuard(isDirty: boolean) {
  // Browser close / refresh
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // In-app route changes
  const blocker = useBlocker(isDirty);

  useEffect(() => {
    if (blocker.state === "blocked") {
      const leave = window.confirm(
        "Du har ulagrede endringer. Er du sikker på at du vil forlate siden?"
      );
      if (leave) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);
}
