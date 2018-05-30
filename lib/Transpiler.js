const Parser = require("./Parser");

class Transpiler {
  constructor(input) {
    this.input = new Parser(input);
    this.ast = this.input.parse();
    this.croak = this.input.croak;
    this.js = this.js.bind(this);

    this.vars = [];
    this.arrays = [];
    this.FALSE = { type: "bool", value: false };
    this.TRUE = { type: "bool", value: true };
  }

  toJS() {
    const jsString = this.js(this.ast);
    const varString = this.declareVars();
    const arrayString = this.declareArrays();
    const compiled = this.combineStr([
      '"use strict";\n\n',
      varString,
      arrayString,
      jsString
    ]);
    return compiled;
    // return Function(compiled);
  }

  js(expr) {
    switch (expr.type) {
      case "num":
      case "str":
      case "bool":
      case "op":
        return this.jsAtom(expr);
      case "var":
        return this.jsVar(expr);
      case "binary":
        return this.jsBinary(expr);
      case "array":
        return this.jsArray(expr);
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
      case "iterate":
        return this.jsIterate(expr);
      case "call":
        return this.jsCall(expr);
      default:
        this.input.croak(
          new Error(
            "Cannot transpile this expression " + JSON.stringify(expr, null, 2)
          )
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
    let leftAssign = this.js(expr.left);
    let rightAssign = this.js(expr.right);
    // grab identifier of left assignment
    const identifier = this.getIdentifier(expr);
    // check if identifier already exists
    // otherwise tack on a 'var' keyword in front
    let isDefined;
    if (expr.left.type === "array" || expr.left.action === "spread") {
      isDefined = this.lookUp(identifier) || this.lookUpArray(identifier);
      if (!isDefined) this.arrays.push({ name: identifier, checked: false });
    } else {
      isDefined = this.lookUp(identifier);
      if (!isDefined) this.vars.push(identifier);
    }

    let prefix = "";
    let subfix = "";

    if (expr.left.action === "spread") {
      leftAssign = identifier;
      subfix +=
        "\n" +
        expr.left.elements
          .map((el, i) => {
            let varName = this.js(el);
            this.vars.push(varName);
            return `${varName}=${identifier}[${i}]`;
          })
          .join("\n");
    }

    const codeStr = prefix + leftAssign + expr.op + rightAssign + subfix;

    return codeStr;
  }

  jsPrimitive() {}

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

  jsIterate(expr) {
    let initVal = this.js(expr.left);
    let finalVal = this.js(expr.right);
    // const codeStr = `(function() {
    //   var array = [];
    //   for (var i = ${initVal}${
    //   initVal != 0 ? "-1" : ""
    // }; i < ${finalVal}; i++) {
    //     array.push(i);
    //   }

    //   return array;
    // })()`;
    const codeStr = `__iterateArray(${initVal},${finalVal})`;
    return codeStr;
  }

  jsArray(expr) {
    let codeStr = "";
    // if a variable is previously a non array holding variable
    // swap it for the array holding variable list
    if (expr.func) this.swapVarToArray(expr.func.value);
    switch (expr.action) {
      case "binary":
        return expr.func.value + this.genIndex(expr.args);
      case "index":
        return this.makeArrayIndexing(expr);
      case "create":
        return "[" + expr.elements.map(el => this.js(el)).join(", ") + "]";
      case "spread":
        return "var [" + expr.elements.map(el => this.js(el)).join(", ") + "]";
    }
  }

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
    if (expr.primitive) {
      return this.jsPrimitiveFunc(expr);
    } else {
      return this.js(expr.func) + "(" + expr.args.map(this.js).join(", ") + ")";
    }
  }

  jsPrimitiveFunc(expr) {
    switch (expr.func.value) {
      case "__indexArray":
        const codeStr =
          this.js(expr.func) +
          "(" +
          expr.args.map(this.js).join(", ") +
          ")" +
          "[" +
          expr.args[expr.args.length - 1].value +
          "-1]";
        return codeStr;
      default:
        return (
          this.js(expr.func) + "(" + expr.args.map(this.js).join(", ") + ")"
        );
    }
  }

  // Primitive Methods
  //--------------------------------------------------------
  jsIf(expr) {
    return (
      "if (" +
      this.js(expr.cond) +
      ") {\n" +
      this.js(expr.then) +
      "\n}" +
      (expr.else ? "else {" + this.js(expr.else) + "}" : "")
    );
  }

  jsFor(expr) {
    // grab components of a for loop from epxression token
    let counterVar = expr.cond.left.value; // counter variable
    let initialVal = // initialize value for counter
      expr.cond.right.left.type === "num"
        ? expr.cond.right.left.value
        : expr.cond.right.left.value;

    // if a interable character (:) convert to <=, otherwise use the same
    let operation = this.jsOp(expr.cond.right.op);

    //  exit condition for loop
    let finalVal =
      expr.cond.right.right.type === "num"
        ? expr.cond.right.right.value
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

  declareVars() {
    return this.vars.map(el => "var " + el).join(";\n") + ";\n";
  }

  declareArrays() {
    return this.arrays.map(el => "var " + el.name + "=[]").join(";\n") + ";\n";
  }

  swapVarToArray(name) {
    if (this.lookUp(name)) {
      this.vars = this.vars.filter(el => el !== name);
      if (!this.lookUpArray(name)) {
        this.arrays.push({ name: name, checked: false });
      }
    }
  }

  lookUp(name) {
    return this.vars.indexOf(name) >= 0;
  }

  lookUpArray(name) {
    const isFound = this.arrays.filter(el => el.name === name)[0];
    return isFound;
  }

  combineStr(strArray) {
    return strArray.join("\n");
  }

  // grab identifier from assignment expression
  getIdentifier(expr) {
    switch (expr.left.type) {
      case "var":
        return this.js(expr.left);
      case "call":
        return this.js(expr.left.args[0]);
      case "array":
        if (expr.left.action === "spread") {
          return this.js(expr.left.identifier);
        } else {
          return this.js(expr.left.func);
        }
      default:
        throw new Error(
          "Cannot parse this identifier token " +
            JSON.stringify(expr.left, null, 2)
        );
    }
  }

  // check to make sure that the array index exists
  makeArrayIndexing(expr) {
    const identifier = expr.func.value;
    const index = expr.args.map(arg => "[" + this.js(arg) + "]").join("");
    const indexSyntax = identifier + index;
    // let existCheck = this.checkArrayDimension(expr);
    let existCheck = "";
    return existCheck + "\n" + identifier + index;
  }

  isArrayChecked(identifier) {
    const arrayVar = this.arrays.filter(el => el.name === identifier)[0];
    // console.log(arrayVar, identifier);
    return arrayVar ? arrayVar.checked : false;
  }

  updateArrayChecked(identifier) {
    if (this.arrays.filter(el => el.name === identifier).length) {
      this.arrays.map(el => {
        if (el.name === identifier) el.checked = true;
        return el;
      });
    } else {
      // this.push({});
    }
  }

  checkArrayDimension(expr, cDim = 1, checkStr = "") {
    const identifier = expr.func.value;
    const isChecked = this.isArrayChecked(identifier);
    // const isChecked = false;
    if (!false) {
      const currentIndexDim = this.genIndex(expr.args, cDim);
      checkStr +=
        identifier +
        currentIndexDim +
        " ? \n" +
        (cDim < expr.args.length
          ? this.checkArrayDimension(expr, ++cDim, checkStr)
          : "null") +
        " \n" +
        ": " +
        identifier +
        currentIndexDim +
        "=[]";
      this.updateArrayChecked(identifier);
    }
    return checkStr;
  }

  genIndex(args, limit = args.length) {
    let codeStr = "";
    return (
      codeStr +
      args.map((arg, i) => (i < limit ? "[" + arg.value + "]" : null)).join("")
    );
  }
}

module.exports = Transpiler;
