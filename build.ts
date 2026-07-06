import { $, build } from 'bun'
import pack from './package.json'

await $`rm -rf dist`

const external = Object.keys(pack.dependencies).filter(
  x => !["elysia-jsonrpc"].includes(x)
);

const buildresults = await Promise.all([
  build({
    entrypoints: ["./src/index.ts", "./src/types.ts"],
    format: "esm",
    outdir: "dist",
    naming: "[name].mjs",
    external,
  }),
  build({
    entrypoints: ["./src/index.ts", "./src/types.ts"],
    format: "cjs",
    outdir: "dist",
    naming: "[name].cjs",
    external,
  }),
  $`tsc --project tsconfig.dts.json`
])

console.log(buildresults.map((x:any) => x['success'] != undefined? x.success : x.exitCode == 0))

process.exit()
