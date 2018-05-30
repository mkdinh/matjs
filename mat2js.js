"use strict";

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

var alpha;
var beta;
var clim;
var icyclic;
var E;
var x;

var H = [];
var _ebehbdjidb = [];
var C = [];
var Cneg = [];
var Cpos = [];
var y = [];

alpha = -6.8;
beta = -3.6;
clim = 6;
icyclic = 1;
for (var k = 0; k <= clim; k++) {
  H[k] ? (H[k][k] ? null : (H[k][k] = [])) : (H[k] = []);
  H[k][k] = alpha;
  for (var m = 0; m <= clim; m++) {
    if (m == k + 1) {
      H[k] ? (H[k][m] ? null : (H[k][m] = [])) : (H[k] = []);
      H[k][m] = beta;
    }
    H[m] ? (H[m][k] ? null : (H[m][k] = [])) : (H[m] = []);
    H[m][k] = beta;
  }
}
if (icyclic !== 0) {
  H[clim] ? (H[clim][1] ? null : (H[clim][1] = [])) : (H[clim] = []);
  H[clim][1] = beta;
}
H[1] ? (H[1][clim] ? null : (H[1][clim] = [])) : (H[1] = []);
H[1][clim] = beta;
_ebehbdjidb = eig(H);
E = _ebehbdjidb[0];
C = _ebehbdjidb[1];
Cpos = zeros(clim, clim);
Cneg = zeros(clim, clim);
for (var j = 0; j <= clim; j++) {
  for (var jj = 0; jj <= clim; jj++) {
    print("hello");
    if (C[j][jj] < 0) {
      Cneg[jj] ? (Cneg[jj][j] ? null : (Cneg[jj][j] = [])) : (Cneg[jj] = []);
      Cneg[jj][j] = -1 * C[j][jj];
    }
  }
  if (C[j][jj] > 0) {
    Cpos[jj] ? (Cpos[jj][j] ? null : (Cpos[jj][j] = [])) : (Cpos[jj] = []);
    Cpos[jj][j] = C[j] ? (C[j][jj] ? null : (C[j][jj] = [])) : (C[j] = []);
    C[j][jj];
  }
}

diag(E);
ylim([-2.1, 2.1]);
ylim([-4.1, 4.1]);
xlim([0, 5]);
ylabel("Energy (Multiples Of beta)");
set(gca, "fontsize", 15, "xticklabel", "", "linewidth", 2);
title("Molecular Orbital Energies");
if (clim < 21) {
  x = (function() {
    var array = [];
    for (var i = 1 - 1; i < clim; i++) {
      array.push(i);
    }

    return array;
  })();
}

y[x] ? null : (y[x] = []);
y[x] = 0;
for (var k = 0; k <= clim; k++) {
  scatter(
    x,
    y + k,
    console.log(Cneg[k][x], k, x),
    Cneg[k][x],
    "fill",
    "MarkerEdgeColor",
    "r",
    "MarkerFaceColor",
    "r",
  );
  scatter(
    x,
    y + k,
    1000 * Cpos[k][x],
    "fill",
    "MarkerEdgeColor",
    "b",
    "MarkerFaceColor",
    "b",
  );
}
set(
  gca,
  "ytick",
  (function() {
    var array = [];
    for (var i = 0; i < clim - 1; i++) {
      array.push(i);
    }

    return array;
  })(),
);
set(
  gca,
  "xtick",
  (function() {
    var array = [];
    for (var i = 0; i < clim - 1; i++) {
      array.push(i);
    }

    return array;
  })(),
);
xlim([0.5, clim + 0.5]);
ylim([0.5, clim + 0.5]);
xlabel("Atomic Index", "fontsize", 16);
ylabel("State Index", "fontsize", 16);
set(gca, "fontsize", 12, "linewidth", 2);
title("Molecular Orbital Coefficients");
