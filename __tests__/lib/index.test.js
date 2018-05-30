const fs = require("fs");
const path = require("path");
const Parser = require("../../lib");
const Transpiler = require("../../lib/Transpiler");
const primitiveFuncs = require("../../lib/components/primitiveFunctions");
const file = fs.readFileSync(
  path.join(__dirname, "../fixtures/matlab.m"),
  "utf8"
);

Object.assign(global, primitiveFuncs);

describe("Lib Index", () => {
  it("returns abstract syntax trees from provided Matlab code", () => {
    const transpiler = new Transpiler(file);
    const res = transpiler.toJS();
    try {
      fs.writeFileSync(__dirname + "/../mat2js.js", res);
      const data = fs.readFileSync(__dirname + "/../mat2js.js", "utf8");
      Function(data)();
    } catch (err) {
      console.log(err);
    }
  });
});
