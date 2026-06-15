// VERCEL DEPLOYMENT:
// 1. We disable the Cloudflare plugin from @lovable.dev/vite-tanstack-config (cloudflare: false).
// 2. We add the TanStack Start plugin which registers the SSR handler, routes, and
//    server functions with Nitro. Without this, Nitro builds an empty server.
// 3. We add the Nitro plugin with preset: "vercel" to produce .vercel/output/
//    serverless functions instead of Cloudflare Workers.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig({
  cloudflare: false,
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro({
      preset: "vercel",
    }),
  ],
});
