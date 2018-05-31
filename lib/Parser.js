const InputStream = require("./InputStream");
const TokenStream = require("./TokenStream");
const FUNCTIONS = require("./components/FUNCTIONS");
class Parser {
  constructor(input = "") {
    this.currentNode = null;

    if (!input || typeof input === "string")
      this.input = new TokenStream(new InputStream(input));
    else this.input = input;

    this.croak = this.input.croak;

    this.arrayIdentifiers = [];

    this.FALSE = { type: "bool", value: false };
    this.TRUE = { type: "bool", value: true };

    this.FUNCTIONS = FUNCTIONS;

    this.PRECEDENCE = {
      "=": 1,
      "+=": 1,
      "-=": 1,
      "*=": 1,
      "/=": 1,
      "||": 2,
      "&&": 3,
      "<": 7,
      ">": 7,
      "<=": 7,
      ">=": 7,
      "==": 7,
      "===": 7,
      "!=": 7,
      "~=": 7,
      ":": 8,
      "+": 10,
      "-": 10,
      "*": 20,
      "/": 20,
      "%": 20,
    };
  }

  parse() {
    return this.parseTopLevel();
  }

  // Parsers
  //--------------------------------------------------------
  // these methods handle the main parsing logic
  // recursively building an abstract syntax keys

  // high level parsing logic
  // update context for other parsing methods
  parseTopLevel() {
    const prog = [];
    while (!this.input.eof()) {
      const expr = this.parseExpression();
      this.currentNode = expr;
      if (expr) {
        prog.push(expr);
      }
    }

    return { type: "prog", prog: prog };
  }

  // parsing body of function
  parseExpression() {
    return this.maybeCall(() => {
      return this.maybeBinary(this.parseAtom(), 0);
    });
  }

  // low level parsing logic
  // responsible for differentiate between different types
  parseAtom() {
    return this.maybeCall(() => {
      if (this.isPunc("(")) {
        this.input.next();
        const expr = this.parseExpression.apply(this);
        this.skipPunc(")");
        return expr;
      }

      if (this.isPunc("[")) {
        const expr = this.parseSquareBracket();
        return expr;
      }

      if (this.isPunc(";")) return this.skipPunc(";");
      if (this.isPunc("{")) return this.parseProg();
      if (this.isKw("for")) return this.parseFor();
      if (this.isKw("if")) return this.parseIf();
      if (this.isKw("end")) return this.skipKw("end");
      if (this.isKw("true") || this.isKw("false")) return this.parseBool();
      if (this.isKw("function")) {
        this.input.next();
        return parseFunc();
      }
      // get the token for the current character
      const tok = this.input.next();

      // logger(tok);
      // return the appropriate token to the parser
      if (["var", "num", "str", "special"].includes(tok.type)) {
        return tok;
      } else {
        // if encounter an unexpected token, throw error
        this.unexpected(tok);
      }
    });
  }

  delimited(start, stop, seperator, parser) {
    // hold arguments in array
    // also use to parse expression in prog
    const args = [];
    let first = true;
    // skip start of arguments string
    // assumed to usually be "("
    start && this.skipPunc(start);
    // read rest of string until hit stop indicator
    while (!this.input.eof()) {
      if (this.isKw("else")) {
        return args;
      }
      // if (this.input.isWhiteSpace()) continue;
      // if hit stop indicator, exit out of loop
      if (this.isPunc(stop)) break;
      // assumed that there is no seperator for first argument
      // otherwise required that should be a seperator between each argument
      if (first) first = false;
      else if (seperator && this.isPunc(seperator)) this.skipPunc(seperator);
      // the last punctutation is optional
      if (this.isPunc(stop) || this.isKw(stop)) break;
      args.push(parser());
    }
    // console.log(start, stop, seperator, args);
    // skip over stop character
    if (this.isPunc(stop)) this.skipPunc(stop);
    else if (this.isKw(stop)) this.skipKw(stop);
    // logger(args);
    return args;
  }

  // parsing a method invocation into a token
  parseCall(func) {
    // set context for handling brackets inside of arguments
    // this.currentNode = { type: "call" };
    const expr = {
      type: "call",
      func: func,
      primitive: this.isPrimitiveFunc(func.value),
      args: this.delimited("(", ")", ",", this.parseExpression.bind(this)),
    };
    // if the next character is an '=' and not a primitive, then it is an
    // indexing of array, not a func calls
    if (this.isOp("=") && !expr.primitive) {
      expr.type = "array";
      expr.action = "index";
    } else if (this.isOp() && !expr.primitive) {
      expr.type = "array";
      expr.action = "binary";
    }

    if (expr.type === "array") this.arrayIdentifiers.push(expr.func.value);
    // console.log(this.arrayIdentifiers);
    return expr;
  }

  parseOp() {}

  parseProg() {
    // return array of tokenized expression
    // betweene the curly braces
    // punctuation is optional
    const prog = this.delimited(
      null,
      "end",
      "\n",
      this.parseExpression.bind(this),
    );

    if (prog.length === 0) return this.FALSE;
    if (prog.length === 1) return prog[0];

    return { type: "prog", prog: prog.filter(expr => expr) };
  }

  parseNegativeSign(nextPrec) {
    this.input.next();
    const binary = {
      type: "binary",
      op: "*",
      left: {
        type: "num",
        value: -1,
      },
      right: this.maybeBinary(this.parseAtom(), nextPrec),
    };

    // const expr = this.maybeBinary(binary, nextPrec);

    // return expr;
    // return this.maybeArray(binary, () => {
    return this.maybeArrayOp(binary, () => {
      return this.maybeBinary(binary, nextPrec);
    });
    // });
  }

  parseSquareBracket() {
    let expr = {
      type: "array",
      action: "create",
      elements: this.delimited("[", "]", ",", this.parseExpression.bind(this)),
    };
    // }

    if (this.isOp("=")) {
      expr.identifier = this.input.genUniqueIdentifier();
      expr.action = "spread";
    }

    return expr;
  }

  parseFunc() {
    return {
      type: "func",
      vars: this.delimited("(", ")", ",", this.parseVarName.bind(this)),
      body: this.parseExpression(),
    };
  }

  // parse an for loop
  parseWhile() {
    // skip characters 'for'
    this.skipKw("while");
    // grab the for loop condition
    const cond = this.parseExpression();
    // check the content of the expression
    const tok = { type: "while", cond: cond, body: this.parseProg() };

    return tok;
  }

  // parse an for loop
  parseFor() {
    // skip characters 'for'
    this.skipKw("for");
    // grab the for loop condition
    const cond = this.parseExpression();
    // check the content of the expression
    const tok = { type: "for", cond: cond, body: this.parseProg() };

    return tok;
  }

  // parse an if statement
  parseIf() {
    // assumed that substring begins with 'if'
    //skip keyword if
    this.skipKw("if");
    // grab if conditition, comma delimited
    const cond = this.parseExpression();
    // check the content of the expression
    var then = this.parseProg();
    var tok = { type: "if", cond: cond, then: then };
    // check to see if there is an 'else' condition
    if (this.isKw("else")) {
      this.input.next();
      tok.else = this.parseExpression();
    }

    return tok;
  }

  // expect arguments of function to be of type variable
  parseVarName() {
    const token = this.input.next();
    if (token.type != "var") this.input.croak("Expect variable name");
    return token.value;
  }

  parseReturnType(func) {}

  parseType(value) {
    switch (value) {
      case ":":
        return "iterate";
      case "...":
        return "spread";
      case "=":
        return "assign";
      default:
        return "binary";
    }
  }

  parseBool() {
    // return a { type: 'kw', value: 'false' } token
    const token = this.input.next();
    // parse into a boolean token
    return {
      type: "bool",
      value: token.value === "true",
    };
  }

  // Maybes
  //--------------------------------------------------------
  maybeArray(expr) {
    let isLeftArray, isRightArray;
    // if an assignment, check only if right hand side is an array
    if (expr.type === "assign") {
      isRightArray = this.isArray(expr.right);
      if (isRightArray) {
        this.arrayIdentifiers.push(expr.left.value);
      }
    }
    // if a binary, check left and right
  }
  // these methods check the context of the string and determine
  // if certains commands is being invoke (ex: a function call)
  maybeArrayIndex(context, expr) {
    if (this.isPrimitiveFunc(context.value)) {
      return expr();
    } else if (context) {
      let expr;
      // grab indexing arguments from string
      const args = this.delimited(
        "(",
        ")",
        ",",
        this.parseExpression.bind(this),
      );
      // check if the argument passed in is an array
      // if it is then they are using the user is attempting to create an array
      // if the argument array's length;
      let isIteratable = false;
      // args.forEach(arg => {
      //   if (this.isArray(arg)) {
      //     isIteratable = true;
      //   }
      // });

      if (false) {
        expr = {
          type: "call",
          primitive: { name: "__interateArray", returnType: "array" },
          arrayId: context.value,
          func: { type: "var", value: "__iterateArray" },
          action: "",
          args: args,
        };
      } else {
        expr = {
          type: "call",
          primitive: { name: "__indexArray", returnType: "num" },
          arrayId: context.value,
          func: { type: "var", value: "__indexArray" },
          action: "",
          args: args,
        };
      }
      // push function name as argument
      // assuming that anything that hit this point is an array
      expr.args.unshift(context);
      // this.arrayIdentifiers.push({ name: context.value, checked: false });
      return expr;
    } else {
      return expr();
    }
  }

  maybeCall(expr) {
    expr = expr();
    return this.isPunc("(")
      ? this.maybeArrayIndex(expr, () => this.parseCall(expr))
      : expr;
  }

  maybeArrayOp(binary, expr) {
    // this.maybeArray(binary);
    // if (["binary", "assign"].includes(binary.type)) return expr();
    // handle cases of array operation that maybe differ
    // from regular binary operation, especially regard
    // element-wise operation and matrix operation

    // check for unary expression
    //(left is a -1/1) and (right is an array expression)
    if (
      binary.op === "*" &&
      (binary.left.value === -1 || binary.left.value === 1) &&
      binary.right.primitive.name === "__indexArray"
    ) {
      const opTok = { type: "op", value: binary.op };
      return {
        type: "call",
        func: { type: "var", value: "__unaryArray" },
        args: [binary.left, binary.right],
      };
    }

    // check if either the left or the right side return an array
    // maybe need to make the conditional more flexible
    // by adding the returnType property on the first level

    // if true, then wrap the binary expression with a
    // primitive functions that loop through and perform
    // binary operation on each element of the array
    // if not then keep going through the parsing process
    if (
      binary.type === "binary" &&
      ((binary.left.primitive &&
        binary.left.primitive.returnType === "array") ||
        (binary.right.primitive &&
          binary.right.primitive.returnType === "array"))
    ) {
      let array, scalar, opTok;
      opTok = { type: "op", value: binary.op };
      if (binary.left.primitive.returnType === "array") {
        // console.log(binary);
        array = binary.left;
        scalar = binary.right;
      } else {
        array = binary.right;
        scalar = binary.left;
      }

      return {
        type: "call",
        func: { type: "var", value: "__binaryArray" },
        args: [opTok, array, scalar],
      };
    }

    // since primitive indexing methods returns an array
    // we need to make sure that whenever the method is being called
    // there need to be an assignmenet to a variable it is called upon
    if (
      binary.type === "assign" &&
      binary.left.primitive &&
      binary.left.primitive.name === "__indexArray" &&
      (!binary.right.primitive ||
        binary.right.primitive.name !== "__indexArray")
    ) {
      // let opTok, array, scalar;
      // opTok = { type: "op", value: "=" };
      // logger(this.arrayIdentifiers);
      // logger(binary);
      // scalar = binary.right;
      // array = binary.left;
      // return {
      //   type: "call",
      //   func: { type: "var", value: "__binaryArray" },
      //   args: [opTok, array, scalar],
      // };
    }
    return expr();
  }

  maybeBinary(left, curPrec) {
    let right, type;
    // check if a operator and
    // use to compose binary expression
    // 1 + 2 * 3 => 1 + (2 * 3)
    const tok = this.isOp() || this.isSpecialChar();
    if (tok) {
      // find the operator precedent order of the next value
      // and compare with the current precedent value
      const nextPrec = this.PRECEDENCE[tok.value];
      if (nextPrec > curPrec) {
        this.input.next();
        if (this.isOp("-")) {
          right = this.parseNegativeSign(nextPrec);
        } else {
          right = this.maybeBinary(this.parseAtom(), nextPrec);
        }
        type = this.parseType(tok.value);
        // determine if it is a binary or assignment value
        const binary = {
          type: type,
          op: tok.value,
          left: left,
          right: right,
        };

        // return this.maybeArray(binary, () => {
        return this.maybeArrayOp(binary, () => {
          return this.maybeBinary(binary, curPrec);
        });
        // });
      }
    }
    // console.log(left);
    return left;
  }

  // Validators
  //--------------------------------------------------------
  // these methods return a token if the character matches a specific type
  // and check if the value matches the argument passes in
  // input.peek either return a valid token or null

  isPunc(ch) {
    const tok = this.input.peek();
    return tok && tok.type === "punc" && (!ch || tok.value === ch) && tok;
  }

  isKw(kw) {
    const tok = this.input.peek();
    return tok && tok.type == "kw" && (!kw || tok.value == kw) && tok;
  }

  isOp(op) {
    const tok = this.input.peek();
    return tok && tok.type == "op" && (!op || tok.value == op) && tok;
  }

  isSpecialChar(ch) {
    const tok = this.input.peek();
    return tok && tok.type == "special" && (!ch || tok.value == ch) && tok;
  }

  isPrimitiveFunc(func) {
    return this.FUNCTIONS.filter(el => el.name === func)[0];
  }

  isArray(expr) {
    if (expr.type === "array" || expr.type === "iterate") {
      return true;
    } else if (
      expr.type === "call" &&
      expr.primitive &&
      expr.primitive.returnType === "array"
    ) {
      return true;
    } else if (this.arrayIdentifiers.indexOf(expr.value) >= 0) {
      return true;
    } else {
      return false;
    }
  }

  // Skippers
  //--------------------------------------------------------
  // these methods does not generate tokens but expects
  // the argument passed in to be valid type
  skipPunc(ch) {
    if (this.isPunc(ch)) this.input.next();
    else this.input.croak(`Expecting punctuation: '${ch}'`);
  }

  skipKw(kw) {
    if (this.isKw(kw)) this.input.next();
    else this.input.croak(`Expecting keyword: '${kw}'`);
  }

  skipOp(op) {
    if (this.isOp(op)) this.input.next();
    else this.input.croak(`Expecting operator: '${op}'`);
  }

  unexpected(tok) {
    this.input.croak(
      `Unexpected token: ${JSON.stringify(tok || this.input.peek())}`,
    );
  }

  // Helper methods
  //--------------------------------------------------------
  updateArrayIndentifiers(name) {
    // determine if array is already being keep track of to prevent duplicating
    // array identifier
    const isFound = this.arrayIdentifiers.filter(el => el.name === name)[0];
    if (!isFound) this.arrayIdentifiers.push({ name: name, checked: false });
  }
}

module.exports = Parser;
