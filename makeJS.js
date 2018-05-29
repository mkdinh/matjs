function makeJS(exp) {
  return js(exp);

  function js(exp) {
    switch (exp.type) {
      case "num":
      case "str":
      case "bool":
        return jsAtom(exp);
      case "var":
        return jsVar(exp);
      case "binary":
        return jsBinary(exp);
      case "assign":
        return jsAssign(exp);
      // case "let"    : return js_let    (exp);
      case "func":
        return jsFunc(exp);
      case "if":
        return jsIf(exp);
      case "prog":
        return jsProg(exp);
      case "call":
        return jsCall(exp);
      default:
        throw new Error("Dunno how to make_js for " + JSON.stringify(exp));
    }
  }

  function jsAtom(exp) {
    return JSON.stringify(exp.value); // cheating ;-)
  }

  function makeVar(name) {
    return name;
  }

  function jsVar(exp) {
    return makeVar(exp.value);
  }

  function jsBinary(exp) {
    return "(" + js(exp.left) + exp.operator + js(exp.right) + ")";
  }

  // assign nodes are compiled the same as binary
  function jsAssign(exp) {
    return jsBinary(exp);
  }
  function jsFunc(exp) {
    var code = "(function ";
    if (exp.name) code += makeVar(exp.name);
    code += "(" + exp.vars.map(makeVar).join(", ") + ") {";
    code += "return " + js(exp.body) + " })";
    return code;
  }

  function jsIf(exp) {
    return (
      "(" +
      js(exp.cond) +
      " !== false" +
      " ? " +
      js(exp.then) +
      " : " +
      js(exp.else || FALSE) +
      ")"
    );
  }

  function jsProg(expr) {
    return "(" + expr.prog.map(js).join(", ") + ")";
  }
  function jsCall(expr) {
    return js(expr.func) + "(" + expr.args.map(js).join(", ") + ")";
  }
  // NOTE, all the functions below will be embedded here.
}

module.exports = makeJS;
