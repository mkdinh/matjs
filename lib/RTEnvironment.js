class RTEnvironment {
  constructor(parent) {
    // extends parent variable scope to child
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent || null;
  }

  extend() {
    return new RTEnvironment(this);
  }

  // basically inheritance
  lookup(name) {
    // look up a variable or function
    // start with the current scope
    // if doesn't exists, then search in parent scope
    // loop until global scope
    var scope = this;
    while (scope) {
      if (Object.prototype.hasOwnProperty.call(scope.vars, name)) {
        return scope;
      }

      scope = scope.parent;
    }
  }

  // search only for local variables
  get(name) {
    if (this.vars[name]) return this.vars[name];
    else throw new Error(`Undefined variable: ${name}`);
  }

  // define new property of the current scope
  // allow the ability to shadow a parent scope without actually
  // redefining it
  def(name, value) {
    return (this.vars[name] = value);
  }

  // set the value of a variable where it is defined
  // if not found and we are not a t the global scope, thorw
  // an error
  set(name, value) {
    const scope = this.lookup(name);
    // prevent polutting the global scope
    if (!scope && this.parent) throw new Error(`Undefined variable: ${name}`);
    scope.vars[name] = value;
  }

  // read and run scripts
  evaluate(tok, env) {
    switch (tok.type) {
      case "num":
      case "str":
      case "bool":
        return tok.value;
      default:
        return new Error(
          "I don't know how to evaluate this:" + JSON.stringify(token, null, 2),
        );
    }
  }
}

module.exports = RTEnvironment;
