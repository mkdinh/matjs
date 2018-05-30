%
% SET UP PARAMETERS
%
alpha=-6.8; %diagonal element of Hamiltonian
beta=-3.6; %off-diagonal element of Hamiltonian
clim=6; % number of carbon atoms
icyclic=1; % set icyclic equal to number other than zero to make ring
H = []
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

print(clim)

if icyclic ~= 0
    H(clim,1)=beta;
    H(1,clim)=beta;
end
print(H)
