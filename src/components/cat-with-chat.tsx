"use client";

import { useChatStore } from "@/components/chat-provider";
import { ChatBalloon } from "@/components/chat-balloon";
import { ThemedCatLottie } from "@/components/themed-cat-lottie";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function CatWithChat({ className = "" }: { className?: string }) {
  const { toggle } = useChatStore();
  const t = useTranslations("chat");

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggle}
        className="block w-full cursor-pointer"
        aria-label={t("openChat")}
      >
        <ThemedCatLottie className="w-full" />
      </button>
      <ChatBalloon />
    </div>
  );
}