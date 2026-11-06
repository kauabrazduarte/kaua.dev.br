import localFont from "next/font/local";

// One self-hosted variable family for the site's sans and mono tokens.
export const obelMono = localFont({
  variable: "--font-obel-mono",
  display: "swap",
  src: [
    {
      path: "./ObelMono-Variable.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./ObelMono-VariableItalic.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
});
