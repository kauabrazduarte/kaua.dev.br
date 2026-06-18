"use client";

import { useImperativeHandle } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { m, useAnimate } from "motion/react";

type Props = AnimatedIconProps & {
  ref?: React.Ref<AnimatedIconHandle>;
};

function MailIcon({
  ref,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className = "",
}: Props) {
  const [scope, animate] = useAnimate();

  const start = async () => {
    // The envelope flap re-draws itself, like a letter being sealed/sent.
    animate(
      ".flap",
      { pathLength: [1, 0, 1] },
      { duration: 0.6, ease: "easeInOut" },
    );
    animate(
      ".envelope",
      { scale: [1, 1.06, 1] },
      { duration: 0.5, ease: "backOut" },
    );
  };

  const stop = () => {
    animate(".flap", { pathLength: 1 }, { duration: 0.2, ease: "easeOut" });
    animate(".envelope", { scale: 1 }, { duration: 0.2, ease: "easeOut" });
  };

  useImperativeHandle(ref, () => ({
    startAnimation: start,
    stopAnimation: stop,
  }));

  return (
    <m.svg
      ref={scope}
      onHoverStart={() => start()}
      onHoverEnd={() => stop()}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} cursor-pointer`}
      style={{ overflow: "visible" }}
    >
      <m.g className="envelope" style={{ transformOrigin: "50% 50%" }}>
        <m.rect width="20" height="16" x="2" y="4" rx="2" />
        <m.path className="flap" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </m.g>
    </m.svg>
  );
}

MailIcon.displayName = "MailIcon";

export default MailIcon;
