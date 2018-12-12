const pkg = require("./package.json");

const common = {
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" }
        ]
    },
    entry: "./src/index.ts",
    externals: Object.keys(pkg.dependencies),
    mode: "production"
}

const umd = {
    ...common,
    name: "umd",
    output: {
        filename: "regal-bundler.umd.min.js",
        libraryTarget: "umd"
    }
}

const cjs = {
    ...common,
    name: "cjs",
    output: {
        filename: "regal-bundler.cjs.js",
        libraryTarget: "commonjs2"
    },
    optimization: {
        minimize: false
    }
}

module.exports = [ umd, cjs ];