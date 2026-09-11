import localFont from "next/font/local";

// Iosevka Mono — a single monospaced family used across the whole site (both
// the "sans" and "mono" design tokens point at it). Self-hosted from
// src/app/fonts via next/font/local, so no network requests and no layout
// shift. The four faces cover regular/italic at weights 400 and 700.
export const ioskeleyMono = localFont({
  variable: "--font-ioskeley-mono",
  display: "swap",
  src: [
    {
      path: "./IoskeleyMono-400-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./IoskeleyMono-400-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./IoskeleyMono-700-Regular.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./IoskeleyMono-700-Italic.ttf",
      weight: "700",
      style: "italic",
    },
  ],
});
