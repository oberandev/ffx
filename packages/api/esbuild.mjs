import * as esbuild from "esbuild";
import fs from "node:fs";

const esm = await esbuild.build({
  allowOverwrite: true,
  bundle: true,
  entryPoints: ["src/index.ts"],
  format: "esm",
  metafile: true,
  outfile: "dist/packages/api/module.mjs",
  sourcemap: "linked",
  tsconfig: "tsconfig.lib.json",
});

const cjs = await esbuild.build({
  allowOverwrite: true,
  bundle: true,
  entryPoints: ["src/index.ts"],
  format: "cjs",
  metafile: true,
  outfile: "dist/packages/api/main.cjs",
  sourcemap: "linked",
  tsconfig: "tsconfig.lib.json",
});

fs.writeFileSync("dist/packages/api/meta.esm.json", JSON.stringify(esm.metafile));
fs.writeFileSync("dist/packages/api/meta.cjs.json", JSON.stringify(cjs.metafile));

const assets = [
  "package.json",
  // "yarn.lock",
  "CHANGELOG.md",
  "README.md",
];

assets.map((asset) => {
  fs.copyFileSync(asset, `dist/packages/api/${asset}`);
});
