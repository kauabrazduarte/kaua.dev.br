"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface CopyButtonProps extends Omit<ButtonProps, "children" | "onClick"> {
  /** Text written to the clipboard. */
  value: string;
  /** Idle label. */
  label: string;
  /** Label shown briefly after a successful copy. */
  copiedLabel: string;
}

// Copy-to-clipboard button with a Copy → Check swap and a 2s "copied" window.
// Used on /pix for the Pix key and the copy-and-paste code.
export function CopyButton({
  value,
  label,
  copiedLabel,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API unavailable (insecure context / denied) — fall back to a
      // hidden textarea + execCommand so the button still works.
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // nothing else to try — bail silently
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button type="button" onClick={copy} aria-live="polite" {...props}>
      {copied ? <Check /> : <Copy />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
