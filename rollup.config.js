import typescript from "rollup-plugin-typescript2";
import cleanup from "rollup-plugin-cleanup";
import json from "rollup-plugin-json";
import acorn from "acorn";
import inject from "acorn-dynamic-import/lib/inject";

import pkg from "./package.json";

const banner = `/**
 * Regal Bundler
 *
 * Copyright (c) Joe Cowman
 * Licensed under MIT License (see https://github.com/regal/regal-bundler)
 */`;

/** Suppress Rollup's circular import warnings for TypeScript files */
const suppressCircularImportWarnings = (message, defaultFunc) => {
    if (message.code === "CIRCULAR_DEPENDENCY") {
        return;
    }
    defaultFunc(message);
};

const tsPlugin = typescript({
    tsconfigOverride: {
        compilerOptions: { module: "esNext" }
    }
});

inject(acorn);

export default [
    {
        input: "./src/index.ts",
        output: [
            { file: pkg.main, format: "cjs", banner },
            { file: pkg.module, format: "esm", banner }
        ],
        external: Object.keys(pkg.dependencies),
        plugins: [
            tsPlugin,
            json(),
            cleanup({
                extensions: [".js", ".ts"],
                comments: /^((?!(Joseph R Cowman)|tslint)[\s\S])*$/, // Removes file-header comments and tslint comments
                maxEmptyLines: 0,
                acornOptions: {
                    plugins: {
                        dynamicImport: true
                    }
                }
            })
        ],
        onwarn: suppressCircularImportWarnings
    }
];
