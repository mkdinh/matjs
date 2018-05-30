module.exports = [
  // INTERNAL FUNCTIONS
  { name: "__iterateArray", returnType: "array" },
  { name: "__binaryArray", returnType: "array" },
  { name: "__indexArray", returnType: "array" },
  { name: "zeros", returnType: "array" },
  // NATIVE FUNTION TO MATLABS
  { name: "display", returnType: "null" },
  { name: "zeros", returnType: "array" },
  { name: "eig", returnType: "array" },
  { name: "diag", returnType: "array" },

  // PLOTING FUNCTIONS
  { name: "plot", returnType: "null" },
  { name: "scatter", returnType: "null" },
  { name: "ylim", returnType: "null" },
  { name: "xlim", returnType: "null" },
  { name: "xlabel", returnType: "null" },
  { name: "ylabel", returnType: "null" },
  { name: "set", returnType: "null" },
  { name: "title", returnType: "null" },
  { name: "gca", returnType: "null" }
];
