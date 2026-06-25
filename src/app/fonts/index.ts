import localFont from "next/font/local";

// CommitMono — a single monospaced family used across the whole site (both the
// "sans" and "mono" design tokens point at it). Self-hosted from src/app/fonts
// via next/font/local, so no network requests and no layout shift. The four
// faces cover regular/italic at weights 400 and 700.
export const commitMono = localFont({
  variable: "--font-commit-mono",
  display: "swap",
  src: [
    {
      path: "./CommitMono-400-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./CommitMono-400-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./CommitMono-700-Regular.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./CommitMono-700-Italic.otf",
      weight: "700",
      style: "italic",
    },
  ],
});
