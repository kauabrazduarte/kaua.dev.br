"use client";

import { useImperativeHandle } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { m, useAnimate } from "motion/react";

type Props = AnimatedIconProps & {
  ref?: React.Ref<AnimatedIconHandle>;
};

function HeartIcon({
  ref,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className = "",
}: Props) {
  const [scope, animate] = useAnimate();

  const start = async () => {
    await animate(
      ".heart",
      { scale: [1, 1.15, 1, 1.25, 1] },
      { duration: 0.6, ease: "easeOut" },
    );
  };

  const stop = () => {
    animate(".heart", { scale: 1 }, { duration: 0.2, ease: "easeOut" });
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
      <m.path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <m.path
        className="heart"
        style={{ transformOrigin: "50% 50%" }}
        d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
      />
    </m.svg>
  );
}

HeartIcon.displayName = "HeartIcon";

export default HeartIcon;
