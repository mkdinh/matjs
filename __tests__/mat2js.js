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

var H=[];
var _eijdgfbfjh=[];
var C=[];
var Cneg=[];
var Cpos=[];
var E=[];
var beta=[];
var x=[];
var y=[];

alpha=-6.8; 
beta=-3.6; 
clim=6; 
icyclic=1; 
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
_eijdgfbfjh=eig(H)
C=_eijdgfbfjh[0]
E=_eijdgfbfjh[1]; 
E=diag(E); 
Cpos=__binaryArray("+", zeros(clim, clim), 1e-10); 
Cneg=__binaryArray("+", zeros(clim, clim), 1e-10); 
for (var j=1; j <= clim; j++) {
	for (var jj=1; jj <= clim; jj++) {
	if ((__indexArray(C, j, jj)[jj-1]<0)) {
__indexArray(Cneg, jj, j)[j-1]=__unaryArray(-1, __indexArray(C, j, jj)[jj-1])
}; 
__indexArray(C, j, jj)[jj-1]=__unaryArray(-1, __indexArray(C, j, jj)[jj-1]); 
if ((__indexArray(C, j, jj)[jj-1]>0)) {
__indexArray(Cpos, jj, j)[j-1]=__indexArray(C, j, jj)[jj-1]
}
}
}; 
for (var k=1; k <= clim; k++) {
	plot([1.5, 3.5], [(((__indexArray(E, k, k)[k-1]-alpha)/__indexArray(beta, (__indexArray(E, k, k)[k-1]-alpha))[undefined-1])/beta)], "linewidth", 2, "color", "b")
}; 
ylim([-2.1, 2.1]); 
xlim([0, 5]); 
ylabel("Energy (Multiples Of beta)"); 
set(gca, "fontsize", 15, "xticklabel", "", "linewidth", 2); 
title("Molecular Orbital Energies"); 
Cpos=__binaryArray("+", zeros(clim, clim), 1e-10); 
Cneg=__binaryArray("+", zeros(clim, clim), 1e-10); 
for (var j=1; j <= clim; j++) {
	for (var jj=1; jj <= clim; jj++) {
	if ((__indexArray(C, j, jj)[jj-1]<0)) {
__indexArray(Cneg, jj, j)[j-1]=__unaryArray(-1, __indexArray(C, j, jj)[jj-1])
}; 
if ((__indexArray(C, j, jj)[jj-1]>0)) {
__indexArray(Cpos, jj, j)[j-1]=__indexArray(C, j, jj)[jj-1]
}
}
}; 
if ((clim<21)) {
x=__iterateArray(1,clim); 
__iterateArray(y, x); 
display(y); 
for (var k=1; k <= clim; k++) {
	scatter(x, (y+k), (1000*__indexArray(Cneg, k, x)[x-1]), "fill", "MarkerEdgeColor", "r", "MarkerFaceColor", "r"); 
scatter(x, (y+k), (1000*__indexArray(Cpos, k, x)[x-1]), "fill", "MarkerEdgeColor", "b", "MarkerFaceColor", "b")
}; 
set(gca, "ytick", __iterateArray(0,clim)); 
set(gca, "xtick", __iterateArray(0,clim)); 
xlim([0.5, (clim+0.5)]); 
ylim([0.5, (clim+0.5)]); 
xlabel("Atomic Index", "fontsize", 16); 
ylabel("State Index", "fontsize", 16); 
set(gca, "fontsize", 12, "linewidth", 2); 
title("Molecular Orbital Coefficients")
}; 
display("success!")