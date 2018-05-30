const fs = require("fs");
const path = require("path");
const Transpiler = require("./lib/Transpiler");

const file = fs.readFileSync(
  path.join(__dirname, "__tests__/fixtures/matlab.m"),
  "utf8",
);

global.eig = function(H) {
  let Hmatrix = [];

  return [H, H[0]];
};

global.print = function(msg) {
  // console.log(msg);
};

global.diag = function(H) {
  return [[], []];
};

global.zeros = function() {
  const dimensions = [...arguments].filter(el => el);
  if (dimensions.length > 0) {
    var dim = dimensions[0];
    delete dimensions[0];
    var newArray = new Array();
    for (var i = 0; i < dim; i++) {
      newArray[i] = zeros(...dimensions);
    }
    return newArray;
  } else {
    return 0;
  }
};

global.plot = function() {
  console.log("plot stuff");
};

global.scatter = function() {};

global.ylim = function() {};

global.xlim = function() {};

global.xlabel = function() {};
global.ylabel = function() {};
global.set = function() {};
global.title = function() {};
global.gca = function() {};

const transpiler = new Transpiler(file);
const res = transpiler.toJS();

try {
  fs.writeFileSync(__dirname + "/mat2js.js", res);
  Function(res).apply(global);
} catch (err) {
  console.log(err);
}
