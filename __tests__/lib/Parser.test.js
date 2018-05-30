const TokenStream = require("../../lib/TokenStream");
const InputStream = require("../../lib/InputStream");
const Parser = require("../../lib/Parser");
const parse = Parser.parse;

describe("Parser", () => {
  let tokenStream, parser;

  genParser = code => {
    parser = new Parser(new TokenStream(new InputStream(code)));
  };

  afterEach(() => {
    tokenStream = null;
  });

  // it.only("returns ast without error", () => {
  //   const code = `print([1.5 2.5])\n[a, b] = eig(H)`;
  //   genParser(code);
  //   const ast = parser.parse();
  // });

  describe("Parse Methods", () => {
    describe("parseAtom", () => {
      test("returns correct token", () => {
        genParser("12345");
        const tok = parser.parseAtom();
        expect(tok).to.eql({ type: "num", value: 12345 });
      });
    });

    describe("delimited", () => {
      it("returns correct array of parse arguments", () => {
        genParser("(a, b, c)");
        const args = parser.delimited.apply(parser, [
          "(",
          ")",
          ",",
          parser.parseVarName.bind(parser)
        ]);

        expect(args).to.eql(["a", "b", "c"]);
      });
    });

    describe("parseCall", () => {
      it("returns correct token", () => {
        genParser("(a, b, c)");
        const token = parser.parseCall.apply(parser, [
          { type: "var", name: "display" }
        ]);
        expect(token.type).to.eql("call");
        expect(token.func).to.eql({ type: "var", name: "display" });
      });

      it("returns type 'array' if call before a '='", () => {
        genParser("(h, k) = beta");
        const token = parser.parseCall.apply(parser, ["H"]);
        expect(token.type).to.equal("array");
      });
    });

    describe("parseVarname", () => {
      test("returns correct token", () => {
        genParser("sum");
        const token = parser.parseVarName();
        expect(token).to.equal("sum");
      });
      test("throw error if token type is not var", () => {
        genParser("123456");
        expect(parser.parseVarName.bind(parser)).to.throw(
          /Expect variable name/
        );
      });
    });

    describe("parseProg", () => {
      it("returns correct token", () => {
        genParser("sum = 1 + 2");
        const token = parser.parseProg();
        expect(token).to.eql({
          type: "assign",
          op: "=",
          left: { type: "var", value: "sum" },
          right: {
            type: "binary",
            op: "+",
            left: { type: "num", value: 1 },
            right: { type: "num", value: 2 }
          }
        });
      });
    });

    describe("parseFor", () => {
      it("returns the correct token", () => {
        genParser("for i = 1:s\nsum += i\nsum = sum/2\nend");
        const token = parser.parseFor();
        expect(token).to.eql({
          type: "for",
          cond: {
            type: "assign",
            op: "=",
            left: {
              type: "var",
              value: "i"
            },
            right: {
              type: "iterate",
              op: ":",
              left: {
                type: "num",
                value: 1
              },
              right: {
                type: "var",
                value: "s"
              }
            }
          },
          body: {
            type: "prog",
            prog: [
              {
                type: "binary",
                op: "+=",
                left: {
                  type: "var",
                  value: "sum"
                },
                right: {
                  type: "var",
                  value: "i"
                }
              },
              {
                type: "assign",
                op: "=",
                left: {
                  type: "var",
                  value: "sum"
                },
                right: {
                  type: "binary",
                  op: "/",
                  left: {
                    type: "var",
                    value: "sum"
                  },
                  right: {
                    type: "num",
                    value: 2
                  }
                }
              }
            ]
          }
        });
      });
    });

    describe("parseWhile", () => {
      it("returns the correct token", () => {
        genParser("while sum < 5\nsum += 1\nend");
        const token = parser.parseWhile();
        expect(token).to.eql({
          type: "while",
          cond: {
            type: "binary",
            op: "<",
            left: {
              type: "var",
              value: "sum"
            },
            right: {
              type: "num",
              value: 5
            }
          },
          body: {
            type: "binary",
            op: "+=",
            left: {
              type: "var",
              value: "sum"
            },
            right: {
              type: "num",
              value: 1
            }
          }
        });
      });
    });

    describe("parseIf", () => {
      it("returns correct token", () => {
        genParser(
          "if sum === 3\nprint('hello') \n else \n print('wah wah') \n end}"
        );
        const token = parser.parseIf();
        logger(token);
        expect(token.type).to.equal("if");
        expect(token.then).to.be.instanceof(Object);
        expect(token.else).to.be.instanceof(Object);
      });
    });

    describe("parseFunc", () => {
      test("returns correct token", () => {
        genParser("(a, b, c) \n sum = 1 + 2 end");
        const token = parser.parseFunc.apply(parser);
        expect(token).to.eql({
          type: "func",
          vars: ["a", "b", "c"],
          body: {
            type: "assign",
            op: "=",
            left: {
              type: "var",
              value: "sum"
            },
            right: {
              type: "binary",
              op: "+",
              left: {
                type: "num",
                value: 1
              },
              right: {
                type: "num",
                value: 2
              }
            }
          }
        });
      });
    });

    describe("parseBool", () => {
      test("returns true if parsed value is 'true'", () => {
        genParser("true");
        const token = parser.parseBool();
        expect(token).to.eql({ type: "bool", value: true });
      });
      test("returns false if parsed value is 'false", () => {
        genParser("false");
        const token = parser.parseBool();
        expect(token).to.eql({ type: "bool", value: false });
      });
    });
  });

  describe("Validators", () => {
    describe("isPunc", () => {
      test("returns true if a valid punctuation", () => {
        genParser(";");
        const isPunc = parser.isPunc(";");
        expect(isPunc).to.eql({ type: "punc", value: ";" });
      });

      test("returns false if an invalid punctuation", () => {
        genParser("a");
        const isPunc = parser.isPunc(";");
        expect(isPunc).to.be.false;
      });

      test("returns false if token's value and argument does not match", () => {
        genParser(";");
        const isPunc = parser.isPunc(":");
        expect(isPunc).to.be.false;
      });
    });

    describe("isKw", () => {
      test("returns true if a valid keyword", () => {
        genParser("if");
        const isKw = parser.isKw("if");
        expect(isKw).to.eql({ type: "kw", value: "if" });
      });

      test("returns false if an invalid punctuation", () => {
        genParser("an");
        const isKw = parser.isKw("if");
        expect(isKw).to.be.false;
      });

      test("returns false if token's value and argument does not match", () => {
        genParser("if");
        const isKw = parser.isKw("else");
        expect(isKw).to.be.false;
      });
    });

    describe("isOp", () => {
      test("returns true if a valid keyword", () => {
        genParser("+");
        const isOp = parser.isOp("+");
        expect(isOp).to.eql({ type: "op", value: "+" });
      });

      test("returns false if an invalid punctuation", () => {
        genParser("an");
        const isOp = parser.isOp("+");
        expect(isOp).to.be.false;
      });

      test("returns false if token's value and argument does not match", () => {
        genParser("+");
        const isOp = parser.isOp("-");
        expect(isOp).to.be.false;
      });
    });

    describe("IsSpecialChar", () => {
      test("return correct token", () => {
        genParser(":");
        const token = parser.isSpecialChar(":");
        expect(token).to.eql({ type: "special", value: ":" });
      });
    });
  });

  describe("Skippers", () => {
    describe("skipPunc", () => {
      test("returns token if argument is a valid punctuation", () => {
        genParser("; sum");
        parser.skipPunc(";");
      });

      test("throws error if not a valid punctuation", () => {
        genParser("sum");
        expect(parser.skipPunc.bind(parser, "sum")).to.throw();
      });
    });
    describe("skipKw", () => {
      test("returns token if argument is a valid keyword", () => {
        genParser("if (true)");
        parser.skipKw("if");
      });

      test("throws error if not a valid keyword", () => {
        expect(parser.skipKw.bind(parser, "sum")).to.throw();
      });
    });
    describe("skipOp", () => {
      test("returns token if argument is a valid operator", () => {
        genParser("&&");
        parser.skipOp("&&");
      });

      test("throws error if not a valid operator", () => {
        expect(parser.skipKw.bind(parser, "sum")).to.throw();
      });
    });
  });

  describe("Error Handling", () => {
    test("unexpected", () => {
      genParser("");
      expect(parser.unexpected.bind(parser)).to.throw;
    });
  });
});
