// import * as rollup from "rollup";
import cleanup from "rollup-plugin-cleanup";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";
import { getConfig } from "./get-config";
import { BundlerOptions, RecursivePartial } from "./interfaces-public";

export default async (opts: RecursivePartial<BundlerOptions> = {}) => {
    const config = await getConfig(opts);

    const rollupOpts = {
        input: config.bundleConfig.input.file
        // plugins: [
        //     // typescript({
        //     //     tsconfigOverride: {
        //     //         compilerOptions: { module: "ES2015" }
        //     //     }
        //     // }),
        //     resolve(),
        //     cleanup({
        //         extensions: [".js", ".ts"],
        //         maxEmptyLines: 0
        //     })
        // ]
    };

    // const bundle = await rollup.rollup(rollupOpts);
};
