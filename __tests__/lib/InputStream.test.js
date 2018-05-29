const InputStream = require("../../lib/InputStream");

describe("InputStream", () => {
  let defaultProps, inputStream;
  beforeEach(() => {
    defaultProps = {
      input: "var sum = 1 + 2",
      pos: 0,
      line: 1,
      col: 1,
    };

    inputStream = new InputStream(defaultProps.input);
  });

  afterEach(() => {
    inputStream = null;
  });

  test("has the correct default properties", () => {
    expect(inputStream).to.include(defaultProps);
  });

  describe("Next Method", () => {
    test("return the current character in string", () => {
      const ch = inputStream.next();
      expect(ch).to.equal(defaultProps.input[defaultProps.pos]);
    });

    test("expect the pos and col to increase by one", () => {
      inputStream.next();
      expect(inputStream.pos).to.equal(++defaultProps.pos);
      expect(inputStream.col).to.equal(++defaultProps.col);
    });

    test("if character is a 'newline', increase line by one and sets col to 0", () => {
      inputStream = new InputStream("\n");
      inputStream.next();
      expect(inputStream.line).to.equal(++defaultProps.line);
      expect(inputStream.col).to.equal(0);
    });
  });

  describe("Peek Method", () => {
    it("returns current character", () => {
      const ch = inputStream.peek();
      expect(ch).to.equal(defaultProps.input[defaultProps.pos]);
    });

    it("returns the appropriate character from the current if passing in an number", () => {
      const ch = inputStream.peek(3);
      expect(ch).to.equal(defaultProps.input[defaultProps.pos + 3]);
    });

    it("does not change the input position property", () => {
      expect(inputStream.pos).to.equal(defaultProps.pos);
    });
  });

  describe("OEF Method", () => {
    it("returns false if the current character truthy", () => {
      const isEnd = inputStream.eof();
      expect(isEnd).to.be.false;
    });

    it("returns true if the current character is falsy", () => {
      inputStream = new InputStream("a");
      inputStream.next();
      const isEnd = inputStream.eof();
      expect(isEnd).to.be.true;
    });

    describe("Croak Method", () => {
      test("throw error with current line and col when calls", () => {
        const context = inputStream;
        const msg = "Uh oh!";
        const { line, col } = defaultProps;
        expect(inputStream.croak.bind(context, msg)).to.throw(
          `${msg} (${line}:${col})`,
        );
      });
    });
  });
});
