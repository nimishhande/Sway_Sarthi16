import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";

// VERCEL DEPLOYMENT CONFIGURATION:
// 1. We use standard Vite defineConfig.
// 2. We add the TanStack Start plugin which registers the SSR handler, routes, and
//    server functions with Nitro. Without this, Nitro builds an empty server.
// 3. We add the Nitro plugin with preset: "vercel" to produce .vercel/output/
//    serverless functions instead of Cloudflare Workers.
export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro({
      preset: "vercel",
    }),
  ],
  resolve: {
    alias: {
      "@": `${process.cwd()}/src`,
    },
    tsconfigPaths: true,
  },
  server: {
    host: "::",
    port: 8080,
  },
});
