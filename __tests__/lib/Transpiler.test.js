const Transpiler = require("../../lib/Transpiler");

describe("Transpiler", () => {
  let transpiler;

  beforeAll(() => {
    transpiler = new Transpiler();
  });

  describe("js", () => {
    test("throws error if token type is unknown", () => {
      const tok = { type: "foo", value: "bar" };
      expect(transpiler.js.bind(tok)).to.throw();
    });
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

  describe("jsArray", () => {
    test("action 'index' returns a array indexing string", () => {
      const expr = {
        type: "array",
        action: "index",
        func: { type: "var", value: "H" },
        args: [
          { type: "var", value: "i" },
          { type: "var", value: "j" },
          { type: "var", value: "k" },
        ],
      };

      expect(transpiler.jsArray(expr)).to.match(/H\[i\]\[j\]\[k\]/);
    });

    test("action 'create' returns delimited array string", () => {
      const expr = {
        type: "array",
        action: "create",
        elements: [
          { type: "var", value: "i" },
          { type: "var", value: "j" },
          { type: "var", value: "k" },
        ],
      };
      expect(transpiler.jsArray(expr)).to.equal("[i, j, k]");
    });

    test("action 'spread' returns variable assignment", () => {
      const expr = {
        type: "array",
        action: "spread",
        elements: [
          { type: "var", value: "i" },
          { type: "var", value: "j" },
          { type: "var", value: "k" },
        ],
      };

      expect(transpiler.jsArray(expr)).to.equal("var [i, j, k]");
    });
  });

  describe("jsAssign", () => {
    test("returns stringified assignment expression", () => {
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
      expect(transpiler.jsAssign(expr)).to.equal("sum=(1+2)");
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

      expect(transpiler.jsFunc(expr)).to.match(/\(function(.*){.*}\)/);
    });
  });

  describe("jsProg", () => {
    test("run without error", () => {});
  });

  describe("jsCall", () => {
    test("run without error", () => {});
  });

  describe("Helpers", () => {
    describe("makeVar", () => {
      test("returns the correct name", () => {
        expect(transpiler.makeVar("sum")).to.equal("sum");
      });
    });

    describe("declare vars", () => {
      test("join the array by ';\\n'", () => {
        transpiler.vars = ["a", "b", "c"];
        expect(transpiler.declareVars()).to.equal("var a;\nvar b;\nvar c;\n");
        transpiler.vars = [];
      });
    });

    describe("combineStr", () => {
      test("joins all element in array with \\n", () => {
        expect(transpiler.combineStr(["a", "b", "c"])).to.equal("a\nb\nc");
      });
    });
    describe("getIdentifier", () => {
      test("type 'var", () => {
        const expr = { left: { type: "var", value: "sum" } };
        expect(transpiler.getIdentifier(expr)).to.equal("sum");
      });

      test("type 'array' && action 'spread'", () => {
        const expr = {
          left: {
            type: "array",
            action: "spread",
            identifier: { type: "var", value: "sum" },
          },
        };
        expect(transpiler.getIdentifier(expr)).to.equal("sum");
      });

      test("type 'array' action 'create'", () => {
        const expr = {
          left: {
            type: "array",
            action: "create",
            func: { type: "var", value: "list" },
          },
        };
        expect(transpiler.getIdentifier(expr)).to.equal("list=[]");
      });

      test("throws errors if not a the correct type", () => {
        expect(
          transpiler.getIdentifier.bind(transpiler, { left: { type: "num" } }),
        ).to.throw();
      });
    });

    describe("makeArrayIndex", () => {
      test("returns the correct array index syntax", () => {
        const expr = {
          type: "array",
          action: "index",
          func: { value: "var", value: "H" },
          args: [
            { type: "var", value: "i" },
            { type: "var", value: "j" },
            { type: "var", value: "k" },
          ],
        };

        expect(transpiler.makeArrayIndexing(expr)).to.match(
          /H\[i\]\[j\]\[\k\]/,
        );
      });
    });

    describe("checkArrayDimension", () => {
      test("return the correct ternary expression", () => {
        const expr = {
          type: "array",
          action: "index",
          func: { value: "var", value: "H" },
          args: [
            { type: "var", value: "i" },
            { type: "var", value: "j" },
            { type: "var", value: "k" },
          ],
        };
        expect(transpiler.checkArrayDimension(expr)).to.eql(
          "H[i] ? \nH[i][j] ? \nH[i][j][k] ? \nnull \n: H[i][j][k]= [] \n: H[i][j]= [] \n: H[i]= []",
        );
      });
    });

    describe("genIndex", () => {
      test("return the correct index syntax", () => {
        const expr = {
          args: [
            { type: "var", value: "i" },
            { type: "var", value: "j" },
            { type: "var", value: "k" },
          ],
        };

        expect(transpiler.genIndex(expr.args)).to.equal("[i][j][k]");
      });
    });
  });
});
