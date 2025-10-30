import { context } from "esbuild";
import { BitburnerPlugin } from "esbuild-bitburner-plugin";
import fs from "fs/promises";
/**
 * @type {import('esbuild').Plugin}
 */
const CSSSpoofPlugin = {
    name: "CSSSpoofPlugin",
    setup(pluginBuild) {
        pluginBuild.onLoad({ filter: /.*?\.css$/ }, async (opts) => {
            const file = await fs.readFile(opts.path, { encoding: "utf8" });
            return {
                loader: "jsx",
                contents: `\
        import React from 'react';

        export default function () {
          return <style>{\`${file}\`}</style>;
        }\
        `,
            };
        });
    },
};

const createContext = async () =>
    await context({
        entryPoints: ["servers/**/*.ts", "servers/**/*.tsx"],
        outbase: "./servers",
        outdir: "./build",
        plugins: [
            CSSSpoofPlugin,
            BitburnerPlugin({
                port: 12525,
                types: "NetscriptDefinitions.d.ts",
                mirror: {},
                distribute: {},
            }),
        ],
        bundle: true,
        format: "esm",
        platform: "browser",
        logLevel: "debug",
    });

const ctx = await createContext();
ctx.watch();
