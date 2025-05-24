import * as esbuild from "esbuild";
import glob from "glob";
import fs from "fs/promises";

const getEntryPoints = () => {
  return glob.sync("./src/functions/**/index.ts");
};

const buildOptions = {
  entryPoints: getEntryPoints(),
  bundle: true,
  outdir: "./infra/resources",
  platform: "node",
  target: "es2022",
  format: "esm",
  minify: true,
  sourcemap: false,
  external: ["aws-sdk"],
  banner: {
    js: `
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
      import { fileURLToPath } from 'url';
      import { dirname } from 'path';
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
    `,
  },
};

const build = async () => {
  try {
    await esbuild.build(buildOptions);

    await fs.writeFile(
      "./infra/resources/package.json",
      JSON.stringify({ type: "module" }, null, 2)
    );

    console.log("🎉 Build completed successfully!");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
};

build();
