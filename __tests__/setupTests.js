const { expect } = require("chai");

// set setTimeout fail for jest tests
jest.setTimeout(5000);

function logger(token) {
  console.log(JSON.stringify(token, null, 2));
}

global.logger = logger;
global.expect = expect;
