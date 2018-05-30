"use strict";


var alpha;
var beta;
var clim;
var icyclic;
var H;
var C;
var E;
var Cpos;
var Cneg;

var _hebiifiddd=[];

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
if ((icyclic !== 0)) {
__indexArray(H, clim, 1)[1-1]=beta; 
__indexArray(H, 1, clim)[clim-1]=beta
}; 
_hebiifiddd=eig(H)
C=_hebiifiddd[0]
E=_hebiifiddd[1]; 
E=diag(E); 
Cpos=__binaryArray("+", zeros(clim, clim), 1e-10); 
Cneg=__binaryArray("+", zeros(clim, clim), 1e-10); 
for (var j=1; j <= clim; j++) {
	for (var jj=1; jj <= clim; jj++) {
	if ((__indexArray(C, j, jj)[jj-1]<0)) {
__indexArray(Cneg, jj, j)[j-1]=(-1*__indexArray(C, j, jj)[jj-1])
}; 
if ((__indexArray(C, j, jj)[jj-1]>0)) {
__indexArray(Cpos, jj, j)[j-1]=__indexArray(C, j, jj)[jj-1]
}
}
}; 
display(Cneg)