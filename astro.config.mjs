// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  redirects: {
    "/discord": "https://discordapp.com/users/668849866805477398",
    "/buymeacoffee": "https://buymeacoffee.com/kauabrazduarte",
    "/x": "https://x.com/oKauaDev",
  },
});
