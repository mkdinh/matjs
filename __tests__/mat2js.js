"use strict";


var alpha;
var beta;
var clim;
var icyclic;
var H;
var C;
var E;

var _fabgbfjbfh=[];

alpha=-6.8; 
beta=-3.6; 
clim=6; 
icyclic=1; 
H=[]; 
for (var k=1; k <= clim; k++) {
	__indexArray(H, k, k)[k-1]=alpha; 
for (var m=1; m <= clim; m++) {
	if ((m==(k+1))) {
__indexArray(H, k, m)[m-1]=beta; 
__indexArray(H, m, k)[k-1]=beta
}
}
}; 
display(H); 
if ((icyclic !== 0)) {
__indexArray(H, clim, 1)[1-1]=beta; 
__indexArray(H, 1, clim)[clim-1]=beta
}; 
_fabgbfjbfh=__indexArray(eig, H)[H-1]
C=_fabgbfjbfh[0]
E=_fabgbfjbfh[1]