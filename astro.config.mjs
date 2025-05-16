// @ts-check
import { defineConfig } from 'astro/config';

import preact from "@astrojs/preact";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";

import icon from "astro-icon";

import auth from 'auth-astro';

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  site: "https://takenokos.netlify.app",
  integrations: [preact({ compat: true }), sitemap(), icon(), auth()],
  output: 'server',
  vite: {
    ssr: {
      noExternal: ['gsap']
    },
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
        '@db': '/src/db',
      }
    }
  },

  adapter: netlify({ edgeMiddleware: true })
});
