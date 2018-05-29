const TokenStream = require("../../lib/TokenStream");
const InputStream = require("../../lib/InputStream");
describe("TokenStream", () => {
  let defaultProps, inputStream, tokenStream;

  function genToken(str) {
    inputStream = new InputStream(str);
    tokenStream = new TokenStream(inputStream);
  }

  afterEach(() => {
    inputStream = null;
    tokenStream = null;
  });

  describe("default properties", () => {
    beforeEach(() => {
      defaultProps = {
        input: "var sum = 1 + 2",
        pos: 0,
        line: 1,
        col: 1,
      };

      genToken(defaultProps.input);
    });

    test("has correct default properties", () => {
      expect(tokenStream).to.include({ current: null });
    });

    test("has correct keywords", () => {
      const expectedKeywords = [
        " if ",
        " then ",
        " else ",
        " function ",
        " true ",
        " false ",
      ];

      expectedKeywords.map(kw =>
        expect(tokenStream.validKeywords).to.include(kw),
      );
    });
  });

  describe("Main Methods", () => {
    describe("peek", () => {
      test("returns the next character token if current value is null", () => {
        genToken("oh! hello there");
        expect(tokenStream.current).to.be.null;
        const peeked = tokenStream.peek();
        expect(tokenStream.current).to.eql(peeked);
      });

      test("returns the correct characters from the current position", () => {
        genToken("sum=-5");
        expect(tokenStream.current).to.be.null;
        tokenStream.readIdentifier();
        const peeked = tokenStream.peek(1);
        expect({ type: "op", value: "=" }).to.eql(peeked);
      });

      test("returns the current token if the current token is not null", () => {
        genToken("hello there");
        expect(tokenStream.current).to.be.null;
        const firstPeek = tokenStream.peek();
        const secondPeek = tokenStream.peek();
        expect(secondPeek).to.eql(tokenStream.current);
      });
    });

    describe("next", () => {
      test("returns the current token if it exists", () => {
        genToken("hello there");
        const peek = tokenStream.peek();
        const next = tokenStream.next();
        expect(peek).to.eql(next);
      });

      test("sets current to null", () => {
        genToken("hello there");
        tokenStream.peek();
        expect(tokenStream.current).to.not.be.null;
        tokenStream.next();
        expect(tokenStream.current).to.be.null;
      });

      test("returns readNext() if the current is null", () => {
        genToken("hello there");
        expect(tokenStream.current).to.be.null;
        const nextRead = tokenStream.next();
        expect(nextRead).to.eql({ type: "var", value: "hello" });
      });
    });

    describe("eof", () => {
      test("returns true if end of input", () => {
        genToken("a");
        tokenStream.next();
        expect(tokenStream.eof()).to.be.true;
      });

      test("return false if not at end of input", () => {
        genToken("hello there");
        expect(tokenStream.eof()).to.be.false;
      });
    });

    describe("readNext", () => {
      test("should skip over white space", () => {
        genToken("\n\t\n\t\t\t");
        const token = tokenStream.readNext();
        expect(token).to.be.null;
      });

      test("returns if at the end of input", () => {
        genToken("\n\t\n\t\t\t");
        const token = tokenStream.readNext();
        expect(token).to.be.null;
      });

      test("skips over comments", () => {
        genToken("%hello this is a comment");
        const token = tokenStream.readNext();
        expect(token).to.be.null;
      });

      test("reads as a string if it start with a quote and return the correct token", () => {
        genToken('"Hello there friend"');
        const token = tokenStream.readNext();
        expect(token).to.eql({ type: "str", value: "Hello there friend" });
      });

      test("reads a number if it is a digit and return the correct token", () => {
        genToken("1234567");
        const token = tokenStream.readNext();
        expect(token).to.eql({ type: "num", value: 1234567 });
      });

      test("reads as an indentifier or digit if started with a letter and return the correct oken", () => {
        let token;
        // test for keyword
        genToken("if");
        token = tokenStream.readNext();
        expect(token).to.eql({ type: "kw", value: "if" });
        // test for identifier
        genToken("sum");
        token = tokenStream.readNext();
        expect(token).to.eql({ type: "var", value: "sum" });
      });

      test("reads as punctuation and return the correct token", () => {
        genToken(";");
        const token = tokenStream.readNext();
        expect(token).to.eql({ type: "punc", value: ";" });
      });

      test("reads as operator and returns the correct token ", () => {
        genToken("+");
        const token = tokenStream.readNext();
        expect(token).to.eql({ type: "op", value: "+" });
      });

      test("throws an error if cannot parse a character", () => {
        genToken("�");
        const _this = tokenStream;
        expect(tokenStream.readNext.bind(_this)).to.throw(
          "Can't handle character: '�'",
        );
      });
    });
  });

  describe("Validators", () => {
    beforeEach(() => {
      genToken("");
    });

    describe("isKeyword", () => {
      test("returns true if the character exists in keywords array", () => {
        const isKeyword = tokenStream.isKeyword("if");
        expect(isKeyword).to.be.true;
      });

      test("returns return false if the character does not exist in keywords array", () => {
        const isKeyword = tokenStream.isKeyword("iffy");
        expect(isKeyword).to.be.false;
      });
    });

    describe("isDigit", () => {
      test("returns true if the character match a number", () => {
        const isDigit = tokenStream.isDigit("1");
        expect(isDigit).to.be.true;
      });

      test("returns false if the string does not match a number", () => {
        const isDigit = tokenStream.isDigit("a");
        expect(isDigit).to.be.false;
      });
    });

    describe("isNegDigit", () => {
      test("returns true if the character is a negative number", () => {
        genToken("-12");
        const isNegDigit = tokenStream.isNegDigit("-");
        expect(isNegDigit).to.be.true;
      });

      test("returns false if the character is not a negative number", () => {
        const isNegDigit = tokenStream.isNegDigit("-a");
        expect(isNegDigit).to.be.false;
      });
    });

    describe("isIdStart", () => {
      test("returns true if the character is a valid identifier starter character", () => {
        const isIdStart = tokenStream.isIdStart("_");
        expect(isIdStart).to.be.true;
      });

      test("returns false if the character is not a valid identifier starter character", () => {
        const isIdStart = tokenStream.isIdStart("1");
        expect(isIdStart).to.be.false;
      });
    });

    describe("isId", () => {
      test("returns true if the character is a valid identifier character", () => {
        const isId = tokenStream.isId("2");
        expect(isId).to.be.true;
      });

      test("returns false if the character is a valid identifier starter character", () => {
        const isId = tokenStream.isId("*");
        expect(isId).to.be.false;
      });
    });

    describe("IsOpChar", () => {
      test("returns true if the character is a valid operator character", () => {
        const operators = "*-+/%=&|<>!";
        operators.split("").map(op => {
          const isOpChar = tokenStream.isOpChar(op);
          expect(isOpChar).to.be.true;
        });
      });

      test("returns false if the character is not a valid operator character", () => {
        const isOpChar = tokenStream.isOpChar("d");
        expect(isOpChar).to.be.false;
      });
    });

    describe("isPunc", () => {
      test("returns true if the character is a valid punctuation character", () => {
        const punctuations = ",;(){}[]";
        punctuations.split("").map(punc => {
          const isPunc = tokenStream.isPunc(punc);
          expect(isPunc).to.be.true;
        });
      });

      test("returns false if the character is not a valid punctuation character", () => {
        const isPunc = tokenStream.isPunc("d");
        expect(isPunc).to.be.false;
      });
    });

    describe("isWhiteSpace", () => {
      test("returns true if the character is a valid whitespace character", () => {
        const whitespaces = "\t\n";
        whitespaces.split("").map(ws => {
          const isWhiteSpace = tokenStream.isWhiteSpace(ws);
          expect(isWhiteSpace).to.be.true;
        });
      });

      test("returns true if the character is a not a valid whitespace character", () => {
        const isWhiteSpace = tokenStream.isWhiteSpace("d");
        expect(isWhiteSpace).to.be.false;
      });
    });
  });

  describe("Readers", () => {
    describe("Returns a string", () => {
      describe("readWhile", () => {
        test("reads the string while the predicate is true and returns the substring", () => {
          genToken(
            "isValidIdentifier but only the first word is include in the substring",
          );
          const str = tokenStream.readWhile(tokenStream.isId);
          expect(str).to.equal("isValidIdentifier");
        });

        test("reads the string until the end of line", () => {
          genToken("1234567890");

          const str = tokenStream.readWhile(tokenStream.isDigit);
          expect(str).to.equal("1234567890");
        });
      });

      describe("readEscaped", () => {
        const text = '"this string goes\nto the next line"';
        genToken(text);
        const str = tokenStream.readEscaped('"');
        expect(str).to.equal(text.replace(/\"/g, ""));
      });

      describe("skipComment", () => {
        test("should escape from while loop", () => {
          const text = "hello there \n";
          genToken(text);
          tokenStream.skipComment();
        });
      });
    });

    describe("Returns a token", () => {
      describe("readSpecialChar", () => {
        genToken(":");
        const token = tokenStream.readSpecialChar();
        expect(token).to.eql({ type: "special", value: ":" });
      });

      describe("readNumber", () => {
        test("reads and returns correct token", () => {
          genToken("1234567 notanumber");
          const token = tokenStream.readNumber();
          expect(token.type).to.equal("num");
          expect(token.value).to.equal(1234567);
        });

        test("reads and return correct float number", () => {
          genToken("123.4567 notanumber");
          const token = tokenStream.readNumber();
          expect(token.type).to.equal("num");
          expect(token.value).to.equal(123.4567);
        });

        test("returns only before the first dot if there are two dots", () => {
          genToken("123.45.67 notanumber");
          const token = tokenStream.readNumber();
          expect(token.type).to.equal("num");
          expect(token.value).to.equal(123.45);
        });
      });

      describe("readIdentifer", () => {
        test("reads and returns the correct token", () => {
          genToken("if (true)");
          const token = tokenStream.readIdentifier();
          expect(token.type).to.equal("kw");
          expect(token.value).to.equal("if");
        });

        test("reads and returns the correct token", () => {
          genToken("sum");
          const token = tokenStream.readIdentifier();
          expect(token.type).to.equal("var");
          expect(token.value).to.equal("sum");
        });
      });

      describe("readString", () => {
        test("reads and returns correct token", () => {
          genToken('"It\'s going to read this whole string"');
          const token = tokenStream.readString();
          expect(token.type).to.equal("str");
          expect(token.value).to.equal("It's going to read this whole string");
        });
      });

      describe("readPunc", () => {
        test("reads and returns the correct token", () => {
          genToken(";");
          const token = tokenStream.readPunc();
          expect(token).to.eql({ type: "punc", value: ";" });
        });
      });

      describe("readOp", () => {
        test("reads and return the correct token", () => {
          genToken("&&");
          const token = tokenStream.readOp();
          expect(token).to.eql({ type: "op", value: "&&" });
        });
      });
    });
  });
});
