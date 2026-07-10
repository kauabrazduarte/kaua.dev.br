"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { useChatStore } from "@/components/chat-provider";

const ROTATE_MS = 4500;

export function ChatBalloon() {
  const t = useTranslations("chat");
  const { toggle } = useChatStore();

  const greetings = (t.raw("greetings") as string[]).filter(Boolean);
  const count = greetings.length;

  const [index, setIndex] = useState(() => {
    const n = (t.raw("greetings") as string[]).filter(Boolean).length;
    return n ? Math.floor(Math.random() * n) : 0;
  });

  useEffect(() => {
    if (!count) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [count]);

  const phrase = greetings[index] ?? greetings[0];

  return (
    <motion.button
      type="button"
      onClick={toggle}
      className="group absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[88%] whitespace-nowrap"
      initial={{ opacity: 0, y: 6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -1 }}
      aria-label={phrase}
    >
      <span className="cat-bubble block rounded-lg border border-border/60 bg-popover/95 px-2.5 py-1.5 font-mono text-[11px] leading-tight text-foreground shadow-md backdrop-blur-sm transition-transform group-hover:scale-[1.03]">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={{ duration: 0.25 }}
            className="inline-block"
          >
            {phrase}
          </motion.span>
        </AnimatePresence>
      </span>
      <span
        aria-hidden
        className="cat-bubble-tail absolute -bottom-[5px] left-1/2 block size-2 -translate-x-1/2 rotate-45 border-b border-r border-border/60 bg-popover/95"
      />
    </motion.button>
  );
}