export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

export interface BundlerOptions {
    regalConfigLocation: string;
    pkgLocation: string;
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
    format: string;
    minify: boolean;
}
