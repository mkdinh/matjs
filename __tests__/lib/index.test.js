const fs = require("fs");
const path = require("path");
const Parser = require("../../lib");
const Transpiler = require("../../lib/Transpiler");

const file = fs.readFileSync(
  path.join(__dirname, "../fixtures/matlab.m"),
  "utf8",
);

describe("Lib Index", () => {
  it("returns abstract syntax trees from provided Matlab code", () => {
    const transpiler = new Transpiler(file);
    const res = transpiler.toJS();
    console.log(res);
  });
});
