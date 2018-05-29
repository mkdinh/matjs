const Parser = require("./Parser");

class Transpiler {
  constructor(input) {
    this.ast = new Parser(input).parse();
    this.js = this.js.bind(this);

    this.FALSE = { type: "bool", value: false };
    this.TRUE = { type: "bool", value: true };
  }

  toJS() {
    return this.js(this.ast);
  }

  js(expr) {
    switch (expr.type) {
      case "num":
      case "str":
      case "bool":
        return this.jsAtom(expr);
      case "var":
        return this.jsVar(expr);
      case "binary":
        return this.jsBinary(expr);
      case "assign":
        return this.jsAssign(expr);
      case "func":
        return this.jsFunc(expr);
      case "for":
        return this.jsFor(expr);
      case "if":
        return this.jsIf(expr);
      case "prog":
        return this.jsProg(expr);
      case "call":
        return this.jsCall(expr);
      default:
        throw new Error(
          "Cant transpile this expression" + JSON.stringify(expr, null, 2),
        );
    }
  }

  // Transpiler Methods
  //--------------------------------------------------------
  // these method create stringified javascript code
  // that can be evaluate
  jsAtom(expr) {
    return JSON.stringify(expr.value);
  }

  jsVar(expr) {
    return this.makeVar(expr.value);
  }

  jsBinary(expr) {
    // recursively loop through nested binary tokens
    // and stringify the left and right expression
    return (
      "(" + this.js(expr.left) + this.jsOp(expr.op) + this.js(expr.right) + ")"
    );
  }

  jsAssign(expr) {
    return "var " + this.js(expr.left) + expr.op + this.js(expr.right);
  }

  jsOp(op) {
    switch (op) {
      case ":":
        return " <= ";
      case "~=":
        return " !== ";
      default:
        return op;
    }
  }

  // jsSpread(expr) {
  //   return export
  // }

  jsFunc(expr) {
    // encapsulate function within parentheses to prevent any hoisting error
    // giving it it's own scope
    let codeStr = "(function";
    // make named function optional
    if (expr.name) code += this.makeVar(expr.name);
    // generates argument string
    codeStr += "(" + expr.vars.map(this.makeVar).join(", ") + ")";
    // generate function body
    codeStr += "{" + this.js(expr.body) + "}" + ")";
    return codeStr;
  }

  jsProg(expr) {
    return expr.prog.map(this.js).join("; \n");
  }

  jsCall(expr) {
    return this.js(expr.func) + "(" + expr.args.map(this.js).join(", ") + ")";
  }

  // Primitive Methods
  //--------------------------------------------------------
  jsIf(expr) {
    return (
      this.js(expr.cond) +
      " !== false" +
      " ? " +
      this.js(expr.then) +
      " : " +
      this.js(expr.else || this.FALSE)
    );
  }

  jsFor(expr) {
    // grab components of a for loop from epxression token
    let counterVar = expr.cond.left.value; // counter variable
    let initialVal = // initialize value for counter
      expr.cond.right.left.type === "num"
        ? expr.cond.right.left.value - 1
        : expr.cond.right.left.value;

    // if a interable character (:) convert to <=, otherwise use the same
    let operation = this.jsOp(expr.cond.right.op);

    //  exit condition for loop
    let finalVal =
      expr.cond.right.right.type === "num"
        ? expr.cond.right.right.value - 1
        : expr.cond.right.right.value;

    let initialization = "var " + counterVar + "=" + initialVal;
    let condition = counterVar + operation + finalVal;
    let finalExpression = counterVar + "++";

    let codeStr =
      "for (" +
      initialization +
      "; " +
      condition +
      "; " +
      finalExpression +
      ") {\n";

    codeStr += "\t" + this.js(expr.body) + "\n}";
    return codeStr;
  }

  // Helper Methods
  //--------------------------------------------------------
  makeVar(name) {
    return name;
  }
}

module.exports = Transpiler;
