const RTEnvironment = require("../../lib/RTEnvironment");

describe("RTEnvironment", () => {
  let env;
  beforeEach(() => {
    env = new RTEnvironment();
  });

  test("have the correct default properties", () => {
    expect(env.vars).to.eql({});
    expect(env.parent).to.be.null;
  });

  describe("Main Methods", () => {
    describe("extend", () => {
      test("returns new instance with parent scope", () => {
        env.vars = { foo: "bar" };
        const childEnv = env.extend();
        expect(childEnv.parent).to.be.instanceof(RTEnvironment);
        expect(childEnv.vars).to.eql(env.vars);
      });
    });

    describe("lookup", () => {
      test("returns scope where name is being defined", () => {
        env.vars._internalProp = 1;
        const childEnv = env.extend();
        const newScope = childEnv.lookup("_internalProp");
        expect(newScope).to.eql(env);
      });

      test("returns undefined if name is not found", () => {
        const childEnv = env.extend();
        const newScope = childEnv.lookup("_internalProp");
        expect(newScope).to.be.undefined;
      });
    });

    describe("get", () => {
      test("returns the variable only within local scope", () => {
        env.vars.foo = "bar";
        expect(env.get("foo")).to.equal("bar");
      });

      test("throws error if cannot find var in local scope", () => {
        expect(env.get.bind(env, "foo")).to.throw("Undefined variable: foo");
      });
    });

    describe("def", () => {
      test("sets property to current environment", () => {
        env.def("foo", "bar");
        expect(env.vars.foo).to.equal("bar");
      });

      test("returns the new property value", () => {
        const prop = env.def("foo", "bar");
        expect(prop).to.equal("bar");
      });
    });

    describe("set", () => {
      test("set properties where it is defined", () => {
        env.def("foo", "bar");
        const childEnv = env.extend();
        childEnv.set("foo", "baz");
        expect(env.vars.foo).to.equal("baz");
      });

      it("throws an error if cannot find variable", () => {
        const childEnv = env.extend();
        expect(childEnv.set.bind(childEnv, "foo", "baz")).to.throw(
          "Undefined variable: foo",
        );
      });
    });

    describe("evaluate", () => {
      it("returns value of type 'num', 'str', 'bool'", () => {
        const numTok = { type: "num", value: 2 };
        expect(env.evaluate(numTok)).to.equal(numTok.value);
        const strTok = { type: "str", value: "Hello There!" };
        expect(env.evaluate(strTok)).to.equal(strTok.value);
        const boolTok = { type: "bool", value: false };
        expect(env.evaluate(boolTok)).to.equal(boolTok.value);
      });
    });
  });
});
