const Transpiler = require("../../lib/Transpiler");

describe("Transpiler", () => {
  let transpiler;

  beforeAll(() => {
    transpiler = new Transpiler();
  });

  describe("jsAtom", () => {
    test("return a stringified value for type 'str'", () => {
      const strExpr = { type: "str", value: "Hello There!" };
      expect(transpiler.js(strExpr)).to.equal(JSON.stringify(strExpr.value));
    });
    test("returns a stringified value for type 'num'", () => {
      const numExpr = { type: "num", value: 2 };

      expect(transpiler.js(numExpr)).to.equal(JSON.stringify(numExpr.value));
    });
    test("returns stringified value for type 'bool", () => {
      const boolExpr = { type: "bool", value: false };
      expect(transpiler.js(boolExpr)).to.equal(JSON.stringify(boolExpr.value));
    });
  });

  describe("isVar", () => {
    it("returns expression's name", () => {
      const expr = { type: "var", value: "total" };
      expect(transpiler.jsVar(expr)).to.equal("total");
    });
  });

  describe("jsBinary", () => {
    it("returns stringfied binary expression", () => {
      const expr = {
        type: "assign",
        op: "=",
        left: { type: "var", value: "sum" },
        right: {
          type: "binary",
          op: "+",
          left: { type: "num", value: 1 },
          right: { type: "num", value: 2 },
        },
      };
      expect(transpiler.jsBinary(expr)).to.equal("(sum=(1+2))");
    });
  });

  describe("jsAssign", () => {
    it("returns stringfied assignment expression", () => {
      const expr = {
        type: "assign",
        op: "=",
        left: { type: "var", value: "sum" },
        right: {
          type: "binary",
          op: "+",
          left: { type: "num", value: 1 },
          right: { type: "num", value: 2 },
        },
      };
      expect(transpiler.jsAssign(expr)).to.equal("(sum=(1+2))");
    });
  });

  describe("jsFunc", () => {
    test("returns a stringified function definition", () => {
      const expr = {
        type: "func",
        vars: ["a", "b", "c"],
        body: {
          type: "assign",
          op: "=",
          left: {
            type: "var",
            value: "sum",
          },
          right: {
            type: "binary",
            op: "+",
            left: {
              type: "num",
              value: 1,
            },
            right: {
              type: "num",
              value: 2,
            },
          },
        },
      };

      logger(transpiler.jsFunc(expr));
      expect(transpiler.jsFunc(expr)).to.match(/\(function(.*){.*}\)/);
    });
  });

  describe("jsProg", () => {
    test("run without error", () => {});
  });

  describe("jsCall", () => {
    test("run without error", () => {});
  });
});
