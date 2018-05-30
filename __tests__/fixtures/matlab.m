%
% SET UP PARAMETERS
%
alpha=-6.8; %diagonal element of Hamiltonian
beta=-3.6; %off-diagonal element of Hamiltonian
clim=6; % number of carbon atoms
icyclic=1; % set icyclic equal to number other than zero to make ring
H = [];
%
% BELOW PROGRAM EXECUTES INSTRUCTIONS GIVEN IN LINES 5-8
%
%
% BUILD HAMILTONIAN FOR POLYENE
%
for k=1:clim
    H(k,k)=alpha;
        for m=1:clim
            if m==k+1
               H(k,m)=beta;
                H(m,k)=beta;
            end
        end
end


if icyclic ~= 0
    H(clim,1)=beta;
    H(1,clim)=beta;
end

% OBTAIN EIGENVALES AND COEFFICIENTS
%
[C, E]=eig(H);

E= diag(E);

% SHUFFLE POSITIVE AND NEGATIVE COEFFICIENTS
%
Cpos=zeros(clim,clim)+1e-10;
Cneg=zeros(clim,clim)+1e-10;
for j=1:clim
    for jj=1:clim
        if C(j,jj) < 0
            Cneg(jj,j)= -C(j,jj);
        end
        if C(j,jj) > 0
            Cpos(jj,j)=C(j,jj);
        end
    end
end

display(Cneg)