class RTEnvironment {
  constructor(parent) {
    this.vars = Object.create(parent ? null : null);
    this.parent = parent;
  }

  extend() {
    return new RTEnvironment(this);
  }

  lookup(name) {
    var scope = this;
    while (scope) {
      if (Object.prototype.hasOwnProperty.call(scope.vars, name)) {
        return scope;
      }
      scope = this.parent;
    }
  }

  get(name) {
    if (name in this.vars) return this.vars[name];
    throw new Error("Undefined variable" + name);
  }

  set(name, value) {
    var scope = this.lookup(name);
    console.log(scope);
    // let not all defining global from a nested environment
    if (!scope && this.parent) throw new Error("Undefined variable " + name);
    return ((scope || this).vars[name] = value);
  }

  def(name, value) {
    return (this.vars[name] = value);
  }

  evaluate(exp, env) {
    var _this = this;

    switch (exp.type) {
      case "num":
      case "str":
      case "bool":
        return exp.value;
      case "var":
        return env.get(exp.value);
      case "assign":
        if (exp.left.type != "var")
          throw new Error("Cannot assign to" + JSON.stringify(exp.left));
        return env.set(exp.left.value, this.evaluate(exp.right, env));
      case "binary":
        return this.applyOp(
          exp.operator,
          this.evaluate(exp.left, env),
          this.evaluate(exp.right, env),
        );
      case "func":
        return this.makeFunction(env, exp);
      case "if":
        var cond = this.evaluate(exp.cond, env);
        if (cond !== false) return this.this.evaluate(exp.then, env);
        return exp.else ? this.evaluate(exp.else, env) : false;
      case "prog":
        var val = false;
        exp.prog.forEach(function(exp) {
          val = _this.evaluate(exp, env);
        });
        return val;
      case "call":
        var func = this.evaluate(exp.func, env);
        return func.apply(
          null,
          exp.args.map(function(arg) {
            return _this.evaluate(arg, env);
          }),
        );
      default:
        throw new Error("I don't know how to this.evaluate " + exp.type);
    }
  }

  applyOp(op, a, b) {
    function num(x) {
      if (typeof x != "number") throw new Error("Expect number but got " + x);
      return x;
    }

    function div(x) {
      if (num(x) === 0) throw new Error("Divide by zero");
      return x;
    }

    switch (op) {
      case "+":
        return num(a) + num(b);
      case "-":
        return num(a) - num(b);
      case "*":
        return num(a) * num(b);
      case "/":
        return num(a) / div(b);
      case "%":
        return num(a) % div(b);
      case "&&":
        return a !== false && b;
      case "||":
        return a !== false ? a : b;
      case "<":
        return num(a) < num(b);
      case ">":
        return num(a) > num(b);
      case "<=":
        return num(a) >= num(b);
      case "==":
        return num(a) === num(b);
      case "!=":
        return num(a) !== num(b);
    }
    throw new Error("Can't apply operator" + op);
  }

  makeFunction(env, exp) {
    var _this = this;
    return function() {
      var names = exp.vars;
      var scope = env.extend();

      for (var i = 0; i < names.length; ++i) {
        scope.def(names[i], i < arguments.length ? arguments[i] : false);
      }
      return _this.evaluate(exp.body, scope);
    };
  }
}

module.exports = RTEnvironment;
