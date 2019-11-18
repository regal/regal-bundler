# regal-bundler Changelog

## v1.3.0 (2019-11-18)

### New Features
* Bundling loads the `gameVersion` property from the `version` property in `package.json` and includes it with the game bundle ([#32](https://github.com/regal/regal-bundler/pull/32))
* Game bundles now list the `gameVersion` in the header, if the version is defined ([#33](https://github.com/regal/regal-bundler/pull/33))

### Dependency Changes
* Update `regal` to "^2.0.0" ([ae073d7](https://github.com/regal/regal-bundler/commit/ae073d7d7c4b663bd0e8aee17d83ab01fd554e39))
* Bump `rollup-plugin-typescript2` to "^0.25.2" ([ae073d7](https://github.com/regal/regal-bundler/commit/ae073d7d7c4b663bd0e8aee17d83ab01fd554e39))

## v1.2.0 (2019-03-08)

### Dependency Changes
* Change `typescript` from a dev dependency to a direct dependency ([0594c24](https://github.com/regal/regal-bundler/commit/0594c24f661b00c434571b8ab82f01a2bb51422b)), fixes [#26](https://github.com/regal/regal-bundler/issues/26)
* Change `regal` from a direct dependency to a peer dependency ([7943714](https://github.com/regal/regal-bundler/commit/79437148319203158d542627deef04cf5c8a5204)), resolves [#27](https://github.com/regal/regal-bundler/issues/27)

## v1.1.0 (2019-02-16)

### New Features
* **bundle**: Add console log when a bundle is done being created ([#24](https://github.com/regal/regal-bundler/pull/24)), resolves [#23](https://github.com/regal/regal-bundler/pull/23)

### Bug Fixes
* **config**: Add fallback when trying to resolve configLocation to load relative to the current working directory ([#22](https://github.com/regal/regal-bundler/pull/22)), resolves [#21](https://github.com/regal/regal-bundler/pull/21)

### Dependency Changes
* Update to `regal@1.0.0` ([ac715e0](https://github.com/regal/regal-bundler/commit/ac715e07ded49bc9107accc2e493366957e44478))

## v1.0.0 (2018-12-30)
Initial Release