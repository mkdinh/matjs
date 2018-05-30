"use strict";


var alpha;
var beta;
var clim;
var icyclic;
var H;
var E;
var x;

var H=[];
var _hbfciadhgd=[];
var C=[];
var Cneg=[];
var Cpos=[];
var y=[];

alpha=-6.8; 
beta=-3.6; 
clim=6; 
icyclic=1; 
for (var k=0; k <= clim; k++) {
	H[k] ? 
H[k][k] ? 
null 
: H[k][k]=[] 
: H[k]=[]
H[k][k]=alpha; 
for (var m=0; m <= clim; m++) {
	if ((m==(k+1))) {_indexArray(H, k, m)=beta
}; 
_indexArray(H, m, k)=beta
}
}; 
if ((icyclic !== 0)) {_indexArray(H, clim, 1)=beta
}; 
_indexArray(H, 1, clim)=beta; 
_hbfciadhgd=eig(H)
E=_hbfciadhgd[0]
C=_hbfciadhgd[1]; 
Cpos=(zeros(clim, clim)+1e-10); 
Cneg=(zeros(clim, clim)+1e-10); 
for (var j=0; j <= clim; j++) {
	for (var jj=0; jj <= clim; jj++) {
	print(C); 
if ((C[j][jj]<0)) {Cneg[jj] ? 
Cneg[jj][j] ? 
null 
: Cneg[jj][j]=[] 
: Cneg[jj]=[]
Cneg[jj][j]=(-1*_indexArray(C, j, jj))
}
}; 
if ((_indexArray(C, j, jj)>0)) {Cpos[jj] ? 
Cpos[jj][j] ? 
null 
: Cpos[jj][j]=[] 
: Cpos[jj]=[]
Cpos[jj][j]=_indexArray(C, j, jj)
}
}; 
diag(E); 
ylim([-2.1, 2.1]); 
ylim([-4.1, 4.1]); 
xlim([0, 5]); 
ylabel("Energy (Multiples Of beta)"); 
set(gca, "fontsize", 15, "xticklabel", "", "linewidth", 2); 
title("Molecular Orbital Energies"); 
if ((clim<21)) {x=(function() {
      var array = [];
      for (var i = 1-1; i < clim; i++) {
        array.push(i);
      }
      
      return array;
    })()
}; 
y[x] ? 
null 
: y[x]=[]
y[x]=0; 
for (var k=0; k <= clim; k++) {
	scatter(x, (y+k), (1000*_indexArray(Cneg, k, x)), "fill", "MarkerEdgeColor", "r", "MarkerFaceColor", "r"); 
scatter(x, (y+k), (1000*_indexArray(Cpos, k, x)), "fill", "MarkerEdgeColor", "b", "MarkerFaceColor", "b")
}; 
set(gca, "ytick", (function() {
      var array = [];
      for (var i = 0; i < clim; i++) {
        array.push(i);
      }
      
      return array;
    })()); 
set(gca, "xtick", (function() {
      var array = [];
      for (var i = 0; i < clim; i++) {
        array.push(i);
      }
      
      return array;
    })()); 
xlim([0.5, (clim+0.5)]); 
ylim([0.5, (clim+0.5)]); 
xlabel("Atomic Index", "fontsize", 16); 
ylabel("State Index", "fontsize", 16); 
set(gca, "fontsize", 12, "linewidth", 2); 
title("Molecular Orbital Coefficients")