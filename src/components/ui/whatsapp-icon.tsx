"use client";

import { useImperativeHandle } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { m, useAnimate } from "motion/react";

type Props = AnimatedIconProps & {
  ref?: React.Ref<AnimatedIconHandle>;
};

function WhatsAppIcon({
  ref,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className = "",
}: Props) {
  const [scope, animate] = useAnimate();

  const start = async () => {
    animate(
      ".bubble",
      { scale: [1, 0.92, 1], rotate: [0, -3, 0] },
      { duration: 0.5, ease: "easeInOut" },
    );
    animate(
      ".ring",
      { opacity: [0, 0.4, 0], scale: [0.8, 1.3] },
      { duration: 0.6, ease: "easeOut" },
    );
  };

  const stop = () => {
    animate(".bubble", { scale: 1, rotate: 0 }, { duration: 0.2, ease: "easeOut" });
    animate(".ring", { opacity: 0, scale: 1 }, { duration: 0.2, ease: "easeOut" });
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
      fill={color}
      stroke="none"
      className={`${className} cursor-pointer`}
      style={{ overflow: "visible" }}
    >
      <m.circle
        className="ring"
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        style={{ transformOrigin: "50% 50%", opacity: 0 }}
      />
      <m.g
        className="bubble"
        style={{ transformOrigin: "50% 50%" }}
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.362.195 1.878.118.573-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.99 2.901a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.538 1.465 15.87.448 12.039.449 6.269.451 1.588 5.132 1.586 10.902c0 1.719.448 3.388 1.298 4.859L1.5 20.762l5.098-1.335a9.717 9.717 0 004.648 1.185h.004c5.77 0 10.451-4.681 10.453-10.451.001-2.832-1.1-5.493-3.183-7.613z" />
      </m.g>
    </m.svg>
  );
}

WhatsAppIcon.displayName = "WhatsAppIcon";

export default WhatsAppIcon;