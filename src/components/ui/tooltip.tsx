"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

function TooltipContent({
  className,
  sideOffset = 6,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 overflow-hidden rounded-md border border-border bg-popover px-2.5 py-1.5 text-popover-foreground shadow-md",
          // Scale from the edge nearest the trigger so the pop feels anchored.
          "origin-[var(--radix-tooltip-content-transform-origin)]",
          // Enter on open (instant or delayed), exit on close.
          "data-[state=delayed-open]:animate-in data-[state=instant-open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=instant-open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95 data-[state=instant-open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow
          width={11}
          height={5}
          className="fill-popover drop-shadow-[0_1px_0_var(--border)]"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
