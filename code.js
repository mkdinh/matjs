var RTEnvironment = require("./Environment");
var parse = require("./parser");
var makeJS = require("./MakeJS");
var code = "sum = function(x,y) {x + y}; print(sum(2, 3));";

var ast = parse(code);

global.print = function(txt) {
  console.log(txt);
};

var jsCode = makeJS(ast);
var func = eval(makeJS);
console.log(func);
// var globalEnv = new RTEnvironment();

// globalEnv.def("print", function(txt) {});

// globalEnv.evaluate(ast, globalEnv);
