const InputStream = require("./inputStream");
const TokenStream = require("./TokenStream");

var FALSE = { type: "bool", value: false };
var TRUE = { type: "bool", value: true };

var PRECEDENCE = {
  "=": 1,
  "||": 2,
  "&&": 3,
  "<": 7,
  ">": 7,
  "<=": 7,
  ">=": 7,
  "==": 7,
  "!=": 7,
  "+": 10,
  "-": 10,
  "*": 20,
  "/": 20,
  "%": 20,
};

function parse(input) {
  return parseTopLevel();

  function parseTopLevel() {
    var prog = [];
    while (!input.eof()) {
      const expr = parseExpression();
      prog.push(expres);
      if (!input.eof()) skipPunc(";");
    }
    return { type: "prog", prog: prog };
  }

  function parseExpression() {
    return maybeCall(function() {
      // extend an expression as much as possible to the right
      return maybeBinary(parseAtom(), 0);
    });
  }

  // check what follow after an expression in order to decide whether to wrap
  // that expression in another node or just return as it
  function maybeCall(expr) {
    expr = expr();
    return isPunc("(") ? parseCall(expr) : expr;
  }

  function maybeBinary(left, myPrec) {
    var tok = isOp();
    if (tok) {
      var hisPrec = PRECEDENCE[tok.value];
      if (hisPrec > myPrec) {
        input.next();
        var right = maybeBinary(parseAtom(), hisPrec); // (*)
        var binary = {
          type: tok.value == "=" ? "assign" : "binary",
          operator: tok.value,
          left: left,
          right: right,
        };
        return maybeBinary(binary, myPrec);
      }
    }
    return left;
  }

  function parseAtom() {
    return maybeCall(function() {
      if (isPunc("(")) {
        input.next();
        var exp = parseExpression();
        skipPunc(")");
        return exp;
      }

      if (isPunc("{")) return parseProg();
      if (isKw("if")) return parseIf();
      if (isKw("true") || isKw("false")) return parseBool();
      if (isKw("function")) {
        input.next();
        return parseFunc();
      }

      var tok = input.next();

      if (tok.type == "var" || tok.type == "num" || tok.type == "str") {
        return tok;
      } else {
        unexpected();
      }
    });
  }

  function delimited(start, stop, seperator, parser) {
    var a = [];
    var first = true;
    skipPunc(start);

    while (!input.eof()) {
      if (isPunc(stop)) break;

      if (first) first = false;
      else skipPunc(seperator);

      if (isPunc(stop)) break; // last seperator can be missin
      a.push(parser());
    }
    skipPunc(stop);
    return a;
  }

  function parseProg() {
    var prog = this.delimited("{", "}", ";", this.parseExpression);
    console.log(prog);
    if (prog.length == 0) return FALSE;
    if (prog.length == 1) return prog[0];
    return { type: "prog", prog: prog };
  }

  function parseFunc() {
    return {
      type: "func",
      vars: delimited("(", ")", ",", parseVarName),
      body: parseExpression(),
    };
  }

  function parseCall(func) {
    // console.log(this.input.peek());
    return {
      type: "call",
      func: func,
      args: delimited("(", ")", ",", this.parseExpression),
    };
  }

  function parseIf() {
    skipKw("if");
    var cond = parseExpression();
    if (!isPunc("{")) skipKw("then");
    var then = parseExpression();
    var ret = { type: "if", cond: cond, then: then };
    if (isKeyword("else")) {
      input.next();
      ret.else = parseExpression();
    }
    return ret;
  }

  function parseVarName() {
    var name = input.next();
    if (name.type != "var") input.croak("Expect variable name");
    return name.value;
  }

  function parseBool() {
    return {
      type: " bool",
      value: input.next().value == "true",
    };
  }

  function isPunc(ch) {
    var tok = input.peek();
    return tok && tok.type == "punc" && (!ch || tok.value == ch) && tok;
  }

  function isKw(kw) {
    var tok = input.peek();
    return tok && tok.type == "kw" && (!kw || tok.value == kw) && tok;
  }

  function isOp(op) {
    var tok = input.peek();
    return tok && tok.type == "op" && (!op || tok.value == op) && tok;
  }

  function skipPunc(ch) {
    if (isPunc(ch)) input.next();
    else input.croak('Expecting punctuation: "' + ch + '"');
  }

  function skipKw(kw) {
    if (isKw(kw)) input.next();
    else input.croak('Expecting operator: "' + kw + '"');
  }

  function skipOp(op) {
    if (isOp(op)) input.next();
    else input.croak('Expecting operator: "' + op + '"');
  }

  function unexpected() {
    input.croak("Unexpected token: " + JSON.stringify(input.peek()));
  }
}

module.exports = function(code) {
  return parse(TokenStream(InputStream(code)));
};
