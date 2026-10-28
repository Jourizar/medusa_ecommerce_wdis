"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PartyPopper, X } from "lucide-react";

/**
 * Shown once after sign-up or sign-in (?welcome=new|back). The flag is read
 * into state on mount so server re-renders (router.refresh) can't hide it,
 * then stripped from the URL so a refresh or shared link won't repeat it.
 */
export function WelcomeBanner({ name }: { name: string }) {
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const [kind, setKind] = useState(() => {
    const value = params.get("welcome");
    return value === "new" || value === "back" ? value : null;
  });

  useEffect(() => {
    if (kind) window.history.replaceState(null, "", window.location.pathname);
  }, [kind]);

  const isNew = kind === "new";
  const who = name || "friend";

  return (
    <AnimatePresence>
      {kind && (
        <motion.div
          role="status"
          initial={reduce ? false : { opacity: 0, y: -16, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          className="relative mb-8 flex items-start gap-4 bg-accent border-[5px] border-black shadow-[6px_6px_0_0_#000] p-5 md:p-6"
        >
          <div className="shrink-0 w-12 h-12 border-[3px] border-black bg-hotpink flex items-center justify-center">
            <PartyPopper className="w-6 h-6" strokeWidth={3} />
          </div>
          <div className="min-w-0 pr-8">
            <p className="text-brutal text-2xl md:text-3xl text-black break-words">
              {isNew ? `Welcome, ${who}!` : `Welcome back, ${who}!`}
            </p>
            <p className="mt-1 text-sm font-bold uppercase tracking-wide">
              {isNew
                ? "Your account is ready. Your orders will show up here."
                : "You're signed in."}
            </p>
          </div>
          <button
            aria-label="Dismiss"
            onClick={() => setKind(null)}
            className="absolute top-3 right-3 h-9 w-9 inline-flex items-center justify-center border-[3px] border-black bg-cream hover:bg-hotpink transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
