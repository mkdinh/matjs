const fs = require("fs");
const path = require("path");
const Parser = require("../../lib");
const Transpiler = require("../../lib/Transpiler");

const file = fs.readFileSync(
  path.join(__dirname, "../fixtures/matlab.m"),
  "utf8"
);
global.eig = function(H) {
  let Hmatrix = [];

  return [H, H[0]];
};

global.print = function(msg) {
  console.log(msg);
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

global.__indexArray = function() {
  let [array, ...dimensions] = arguments;
  if (!array) {
    array = Array.apply(null, Array(dimensions[0] - 1)).map(
      Number.prototype.valueOf,
      0
    );
  }

  if (dimensions.length > 1) {
    var index = dimensions[0] - 1;
    dimensions.shift();
    return (array[index] = __indexArray(dive(index), ...dimensions));
  } else {
    return array;
  }

  function fillInEmpty(subarray, nextDimSize) {
    if (subarray.length < nextDimSize) {
      for (let i = 0; i < nextDimSize; i++) {
        if (!subarray[i]) subarray[i] = 0;
      }
    }
  }

  function dive(index) {
    return array.filter((el, idx) => {
      fillInEmpty(el, dimensions[0]);
      return idx === index;
    })[0];
  }
};
global.title = function() {};
global.gca = function() {};
global.zeros = function() {};
describe("Lib Index", () => {
  it("returns abstract syntax trees from provided Matlab code", () => {
    const transpiler = new Transpiler(file);
    const res = transpiler.toJS();
    try {
      fs.writeFileSync(__dirname + "/../mat2js.js", res);
      const data = fs.readFileSync(__dirname + "/../mat2js.js", "utf8");
      Function(data)();
    } catch (err) {
      console.log(err);
    }
  });
});
