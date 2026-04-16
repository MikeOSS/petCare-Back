import { build } from "esbuild";
import { copy } from "esbuild-plugin-copy";
import { globSync } from "glob";
import pkg from './package.json';

const allFiles = [...globSync("./src/**/*.ts"), './core/index.ts'];

build({
  entryPoints: allFiles,
  bundle: true,
  splitting: true,
  platform: "node",
  outdir: "dist",
  legalComments: "none",
  charset: "utf8",
  outbase: ".",
  outExtension: { ".js": ".mjs" },
  format: "esm",
  target: "es2022",
  sourcemap: false,
  treeShaking: true,
  minify: false,
  drop: ["debugger"],
  loader: {
    ".node": "file",
    ".sql": "empty",
    ".prisma": "empty",
    ".html": "file",
    ".png": "file",
    ".toml": "empty",
  },
  banner: {
    js: [
      `import { createRequire as __createRequire } from 'module';`,
      `import { fileURLToPath as __fileURLToPath } from 'url';`,
      `import { dirname as __pathDirname } from 'path';`,
      `const __esm_filename = __fileURLToPath(import.meta.url);`,
      `const __esm_dirname = __pathDirname(__esm_filename);`,
      `const require = __createRequire(import.meta.url);`,
    ].join("\n"),
  },
  define: {
    __dirname: "__esm_dirname",
    __filename: "__esm_filename",
    DOMMatrix: "null",
    'process.env.APP_VERSION': JSON.stringify(pkg.version),
  },
  plugins: [
    copy({
      resolveFrom: "cwd",
      assets: [{ from: ["./.env"], to: ["./dist/.env"] }],
    }),
  ],
});
