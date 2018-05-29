// THE CHARACTER INPUT STREAM
//--------------------------------------------------------
class InputStream {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.line = 1;
    this.col = 1;
  }

  next() {
    // grab next character
    const ch = this.input.charAt(this.pos++);
    // keep track of character placement in string
    if (ch == "\n") {
      this.line++;
      this.col = 0;
    } else {
      this.col++;
    }

    return ch;
  }

  peek(num = 0) {
    return this.input.charAt(this.pos + num);
  }

  eof() {
    return this.peek() === "";
  }

  croak(msg) {
    const { line, col } = this;
    throw new Error(`${msg} (${line}:${col})`);
  }
}

module.exports = InputStream;
