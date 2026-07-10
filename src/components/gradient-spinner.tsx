"use client";

import { GradientSpin, type GradientInput, type SpinPattern } from "gradient-spin";
import { cn } from "@/lib/utils";

interface GradientSpinnerProps {
  gradient?: GradientInput;
  pattern?: SpinPattern;
  rows?: number;
  cols?: number;
  cellSize?: number;
  cellGap?: number;
  cellRadius?: number;
  period?: number;
  dim?: number;
  label?: string;
  className?: string;
}

const SUNRISE = "sunrise";

export function GradientSpinner({
  gradient = SUNRISE,
  pattern = "arrow-up",
  rows = 3,
  cols = 3,
  cellSize = 4,
  cellGap = 2,
  cellRadius = 1,
  period = 750,
  dim = 0.1,
  label = "Carregando",
  className,
}: GradientSpinnerProps) {
  return (
    <GradientSpin
      gradient={gradient}
      pattern={pattern}
      rows={rows}
      cols={cols}
      cellSize={cellSize}
      cellGap={cellGap}
      cellRadius={cellRadius}
      period={period}
      dim={dim}
      label={label}
      aria-live="polite"
      className={cn("inline-flex shrink-0", className)}
    />
  );
}