exports.display = function() {
  console.log(...arguments);
};

exports.__iterateArray = function(start, stop, increment = 1) {
  const array = [];
  for (var i = start; i <= stop; i++) {
    array.push(i);
  }
  return array;
};

exports.zeros = function() {
  // filtered out undeifned dimensions from deletion
  // if there is still nesting to be done,
  // recursively dive into the subarray until there no more
  // dimension left go dive and
  // create subarray of zero elemnents of length n from arguments
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

exports.__indexArray = function() {
  let [array, ...dimensions] = arguments;
  // if passing in an array as dimension, then
  // return back a zero array for binaryArray
  if (Array.isArray(dimensions[0])) {
    const empty = zeros(dimensions[0].length);
    console.log(empty);
    return empty;
  }
  // if array is
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

exports.__binaryArray = function(op, array, scalar) {
  // loop through each element of the array
  // if it is another array, then recusively dive
  // into the subarrays until reaches a scalar value
  // then perform operation on that scalar value
  for (let i = 0; i < array.length; i++) {
    if (Array.isArray(array[i])) {
      __binaryArray(op, array[i], scalar);
    } else {
      arrayOp(array, i, op, scalar);
    }
  }

  return array;

  function arrayOp(subArray, index, operator, val) {
    switch (operator) {
      case "+":
        return (subArray[index] += val);
    }
  }
};

exports.eig = function(H) {
  return [H, H[0]];
};

exports.diag = function(E) {
  E = [1, 2, 3, 4, 5, 6];
  const array = zeros(E.length, E.length);
  for (let i = 0; i < E.length; i++) {
    array[i][i] = E[i];
  }

  return array;
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

global.title = function() {};
global.gca = function() {};
