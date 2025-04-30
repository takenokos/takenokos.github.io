// @ts-check
import { defineConfig } from 'astro/config';

import preact from "@astrojs/preact";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://takenokos.netlify.app",
  integrations: [preact(), sitemap(), icon()],

  vite: {
    plugins: [tailwindcss()]
  }
});