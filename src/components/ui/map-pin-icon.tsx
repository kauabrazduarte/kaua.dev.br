"use client";

import { useImperativeHandle } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { m, useAnimate } from "motion/react";

type Props = AnimatedIconProps & {
  ref?: React.Ref<AnimatedIconHandle>;
};

function MapPinIcon({
  ref,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className = "",
}: Props) {
  const [scope, animate] = useAnimate();

  const start = async () => {
    // The pin hops up and settles; the inner dot gives a little ping.
    animate(
      ".pin",
      { y: [0, -4, 0], scale: [1, 1.08, 1] },
      { duration: 0.55, ease: "backOut" },
    );
    animate(
      ".pin-dot",
      { scale: [1, 0.6, 1] },
      { duration: 0.45, ease: "easeInOut" },
    );
  };

  const stop = () => {
    animate(".pin", { y: 0, scale: 1 }, { duration: 0.2, ease: "easeOut" });
    animate(".pin-dot", { scale: 1 }, { duration: 0.2, ease: "easeOut" });
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
      <m.g className="pin" style={{ transformOrigin: "50% 100%" }}>
        <m.path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <m.circle
          className="pin-dot"
          cx="12"
          cy="10"
          r="3"
          style={{ transformOrigin: "12px 10px" }}
        />
      </m.g>
    </m.svg>
  );
}

MapPinIcon.displayName = "MapPinIcon";

export default MapPinIcon;
