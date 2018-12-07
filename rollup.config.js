import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import cleanup from "rollup-plugin-cleanup";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

const banner = `/**
 * Regal bundler source.
 *
 * Copyright (c) Joe Cowman
 * Licensed under MIT License (see https://github.com/regal/regal-bundler)
 */`

/** Suppress Rollup's circular import warnings for TypeScript files */
const suppressCircularImportWarnings = (message, defaultFunc) => {
    if (message.code === "CIRCULAR_DEPENDENCY") {
        return;
    }
    defaultFunc(message);
}

const tsPlugin = typescript({
    tsconfigOverride: {
        compilerOptions: { module: "ES2015" }
    }
});

export default [
    {
        input: "./src/index.ts",
        output: [
            { file: pkg.main, format: "cjs", banner },
            { file: pkg.module, format: "esm", banner }
        ],
        plugins: [
            tsPlugin,
            resolve(),
            cleanup({
                extensions: [".js", ".ts"],
                comments: /^((?!(Joseph R Cowman)|tslint)[\s\S])*$/, // Removes file-header comments and tslint comments
                maxEmptyLines: 0
            })
        ],
        onwarn: suppressCircularImportWarnings
    },
    {
        input: "./src/index.ts",
        output: { file: pkg.browser, format: "umd", name: "RegalBundler" },
        plugins: [
            tsPlugin,
            resolve(),
            terser({
                output: { comments: false, preamble: banner }
            })
        ],
        onwarn: suppressCircularImportWarnings
    }
]