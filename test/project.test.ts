import { expect } from "chai";
import "mocha";

import HelloWorld from "../src/index";

// TODO: Write new tests

describe("Project", function() {
    it("Prints Hello, World!", function() {
        expect(HelloWorld("World")).to.equal("Hello, World!");
    });
});
