module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverageFrom: ["src/**"],
    setupTestFrameworkScriptFile: "<rootDir>/test/jest-setup.js"
};
