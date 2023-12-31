/// <reference types='vitest' />
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: "../../node_modules/.vite/ffx-parser-uuid",

  plugins: [nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    cache: {
      dir: "../../node_modules/.vitest",
    },
    coverage: {
      provider: "v8",
    },
    environment: "node",
    globals: true,
    include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}"],
  },
});
