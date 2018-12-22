export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

export interface BundlerOptions {
    configLocation: string;
    bundler: BundleConfig;
}

export interface BundleConfig {
    input: BundleConfigInput;
    output: BundleConfigOutput;
}

export interface BundleConfigInput {
    file: string;
    ts: boolean;
}

export interface BundleConfigOutput {
    file: string;
    bundle: string;
    format: ModuleFormat;
    minify: boolean;
}

export enum ModuleFormat {
    CJS = "cjs",
    ESM = "esm",
    UMD = "umd"
}
