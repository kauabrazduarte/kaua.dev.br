"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";
import { LazyMotion, domAnimation } from "motion/react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <LazyMotion features={domAnimation}>{children}</LazyMotion>
    </NextThemesProvider>
  );
}
