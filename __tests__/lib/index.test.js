const fs = require("fs");
const path = require("path");
const Parser = require("../../lib");
const Transpiler = require("../../lib/Transpiler");

const file = fs.readFileSync(
  path.join(__dirname, "../fixtures/matlab.m"),
  "utf8"
);

global.eig = function(H) {
  return ["hello", "there"];
};

global.diag = function(H) {
  console.log(H);
};

describe("Lib Index", () => {
  it("returns abstract syntax trees from provided Matlab code", () => {
    const transpiler = new Transpiler(file);
    const res = transpiler.toJS();
    try {
      res.apply(global);
    } catch (err) {
      console.log(err);
    }
  });
});
