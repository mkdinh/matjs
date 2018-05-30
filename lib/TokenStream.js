// THE TOKEN INPUT STREAM
//--------------------------------------------------------
// return stream object with the same interface
// value return by peek and next is an object with properties key & value
// { type: "punc", value: "(" } punctuation: parens, comma, semicolons
// { type: "num", value: 5 } numbers
// { type: "str", value: "Hello world" } strings
// { type: "keyword", value: "function" } keywords
// { type: "var", value: "a" } identifiers
// { type: "op", value: "!=" } operators
class TokenStream {
  constructor(input) {
    this.current = null;
    this.input = input;

    this.vars = [];

    this.validKeywords = [
      " var ",
      " if ",
      " for ",
      " while ",
      " then ",
      " else ",
      " function ",
      " true ",
      " false ",
      " end ",
    ];

    this.validAlphabet = "abcdefghijklmnopqrstuvwxyz";
    this.validDigits = /[0-9]/;
    this.validOperators = "*-+/%~=&|<>!";
    this.validSpecialChars = ":";
    this.validPuncs = ",;(){}[]";
    this.validIdStarters = /[a-z_]/i;
    this.validIdChars = "0123456789";
    this.validWhiteSpaces = "\f\r\t\n ";

    this.croak = input.croak.bind(input);
  }

  // Main Methods
  //--------------------------------------------------------
  // these methods will be used by the parser to generate tokens

  peek(num = 0) {
    return this.current || (this.current = this.readNext(num));
  }

  next() {
    const tok = this.current;
    this.current = null;
    return tok || this.readNext();
  }

  eof() {
    return this.peek() === null;
  }

  readNext(num = 0) {
    // skip over whitespace characters
    this.readWhile(this.isWhiteSpace);
    // return if end of input
    if (this.input.eof()) return null;
    // if it is a #, the skip over comment
    // and return recursive function (start from the top again)
    // assuming that it is a single line comment
    const ch = this.input.peek(num);
    if (ch === "%") {
      this.skipComment();
      return this.readNext(num);
    }
    // check section is the main dispatcher for TokenStream
    // it check the initial condition of each letter and determine
    // if have the possibility of a specific token type

    // if it is a special characters
    if (this.isSpecialChar(ch)) return this.readSpecialChar();
    // if is a digit, then read as a number
    else if (this.isNegDigit(ch) || this.isDigit(ch)) return this.readNumber();
    // if it start with a quote, read as a string
    else if (ch === '"' || ch === "'") return this.readString();
    // if a letter, read as a keyword or identifier
    else if (this.isId(ch)) return this.readIdentifier();
    // if a punctuation, return a punctuation token
    else if (this.isPunc(ch)) return this.readPunc();
    // if a operator, return a operator token
    else if (this.isOpChar(ch)) {
      const op = this.readOp();
      return op;
    }
    // else if none of the above, throw an error
    else this.input.croak(`Can't handle character: '${ch}'`);
  }

  // Validators
  //--------------------------------------------------------
  // validate the type of a single character
  // laer use to return a token with that specific type
  isKeyword(kw) {
    // find kw in keywords array
    return this.validKeywords.indexOf(" " + kw + " ") >= 0;
  }

  isDigit(ch) {
    return this.validDigits.test(ch);
  }

  isSpecialChar(ch) {
    return this.validSpecialChars.indexOf(ch) >= 0;
  }

  isIdStart(ch) {
    return this.validIdStarters.test(ch);
  }

  isId(ch) {
    return this.isIdStart(ch) || this.validIdChars.indexOf(ch) >= 0;
  }

  isOpChar(ch) {
    return this.validOperators.indexOf(ch) >= 0;
  }

  isPunc(ch) {
    return this.validPuncs.indexOf(ch) >= 0;
  }

  isWhiteSpace(ch) {
    return this.validWhiteSpaces.indexOf(ch) >= 0;
  }

  isNegDigit(ch) {
    const nextCh = this.input.peek(1);
    return ch === "-" && this.isDigit(nextCh);
  }

  // Readers
  //--------------------------------------------------------
  // these methods read the string until reaching an exit condition
  // return the appropriate token from read

  // RETURN A STRING
  //--------------------------------------------------------
  readWhile(predicate) {
    // this function read a string until one of the validators return false
    // has to start with a true condition
    let str = "";
    while (
      !this.input.eof() &&
      predicate.apply(this, [this.input.peek(), str])
    ) {
      str += this.input.next();
    }
    // return substring that fullfill the conditition of the predicate
    return str;
  }

  readEscaped(end) {
    // set initial state
    let escaped = false;
    var str = "";
    // go pass start character
    // ex: " or '
    this.input.next();
    // keep reading and push character into substring
    // loop run until the end of input or until hit a 'end' variable
    // ex: " or '
    // if hit an \ character, expect the next character to be an escaped character
    while (!this.input.eof()) {
      const ch = this.input.next();
      if (escaped) {
        str += ch;
        escaped = false;
      } else if (ch == "\\") {
        return (escaped = true);
      } else if (ch === end) {
        break;
      } else {
        str += ch;
      }
    }

    return str;
  }

  // RETURN A TOKEN
  //--------------------------------------------------------
  readSpecialChar() {
    return {
      type: "special",
      value: this.input.next(),
    };
  }

  readNumber() {
    const _this = this;
    let hasDot = false;
    let isNegative = false;
    let isExponential = false;
    let startNum = false;
    var number = this.readWhile(ch => {
      if (startNum && /e|E/.test(ch)) {
        if (!isExponential) {
          isExponential = true;
          return true;
        } else {
          return false;
        }
      }
      // // if number start with a dash
      // // assumed that it is a negative number
      if (ch === "-") {
        // if already set negative assume
        if (isNegative) return false;
        // set negative to true
        isNegative = true;
        // keep predicate being true
        return true;
      }
      if (ch === ".") {
        // not a number if have more than one dot
        // exit out of predicate
        if (hasDot) return false;
        // set dot condition to true
        hasDot = true;
        // continue the loop by satisfy the while loop condition
        return true;
      }
      startNum = true;
      // if not a dot but a number continue the read
      return _this.isDigit(ch);
    });

    // return the number token with parsed number string
    return {
      type: "num",
      value: parseFloat(number),
    };
  }

  readIdentifier() {
    var id = this.readWhile(this.isId);
    return {
      type: this.isKeyword(id) ? "kw" : "var",
      value: id,
    };
  }

  readString() {
    // can be either ' or "
    const quoteType = this.input.peek();
    return { type: "str", value: this.readEscaped(quoteType) };
  }

  readPunc() {
    return { type: "punc", value: this.input.next() };
  }

  readOp() {
    const _this = this;
    return {
      type: "op",
      value: this.readWhile((ch, str) => {
        if (str === "=" && this.input.peek() !== "=") {
          return false;
        }
        return _this.isOpChar(ch);
      }),
    };
  }

  skipComment() {
    this.readWhile(ch => {
      return ch != "\n";
    });
    this.input.next();
  }

  // Helper Methods
  //--------------------------------------------------------
  genUniqueIdentifier() {
    let uniqueVar = "_";

    for (let i = 0; i < 10; i++) {
      uniqueVar += this.validAlphabet[
        Math.floor(Math.random() * this.validIdChars.length)
      ];
    }
    if (this.vars.indexOf(uniqueVar) >= 0) {
      this.genUniqueIdentifier();
    } else {
      this.vars.push(uniqueVar);
      return { type: "var", value: uniqueVar };
    }
  }
}

module.exports = TokenStream;
