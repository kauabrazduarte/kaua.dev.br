import type { ReactNode } from "react";
import "./globals.css";

// Root layout intentionally minimal — the real layout lives at [locale]/layout.tsx
// next-intl middleware will redirect "/" → "/pt" (defaultLocale).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
