%
% SET UP PARAMETERS
%
alpha=-6.8; %diagonal element of Hamiltonian
beta=-3.6; %off-diagonal element of Hamiltonian
clim=6; % number of carbon atoms
icyclic=1; % set icyclic equal to number other than zero to make ring
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
[E, C]=eig(H);


% SHUFFLE POSITIVE AND NEGATIVE COEFFICIENTS
%
Cpos=zeros(clim,clim)+1e-10;
Cneg=zeros(clim,clim)+1e-10;
for j=1:clim
    for jj=1:clim
        print(C)
        if C(j,jj) < 0
            Cneg(jj,j)= -1* C(j,jj);
        end
        if C(j,jj) > 0
            Cpos(jj,j)=C(j,jj);
        end
    end
end

%
% PRINT RESULTS
%
% 'EIGENVALUES'
diag(E)
% 'COEFFICIENTS (EACH COLUMN CORRESPONDS TO DIFFERENT EIGENSTATE & EACH ROW CORRESPONDS TO DIFFERENT COEFFICIENT)'



% PLOT THE ENERGY LEVEL DIAGRAM
%

%for k=1:clim
 %   plot([1.5 3.5],[(E(k,k)-alpha)/beta, (E(k,k)-alpha)/beta],'linewidth',2,'color','b') ;
%end
ylim([-2.1 2.1])
 ylim([-4.1 4.1])
xlim([0 5])
ylabel('Energy (Multiples Of beta)')
set(gca,'fontsize',15,'xticklabel','','linewidth',2)
title('Molecular Orbital Energies')


%
% PLOT THE MOLECULAR ORBITALS
%
if clim <21
    x=1:clim;
    y(x)=0;
    for k=1:clim
        scatter(x,y+k,1000 * Cneg(k,x),'fill','MarkerEdgeColor','r','MarkerFaceColor','r');
        scatter(x,y+k,1000 * Cpos(k,x),'fill','MarkerEdgeColor','b','MarkerFaceColor','b');
    end
    set(gca,'ytick',0:clim);set(gca,'xtick',0:clim)
    xlim([0.5 clim+0.5]);ylim([0.5 clim+0.5])
    xlabel('Atomic Index','fontsize',16)
    ylabel('State Index','fontsize',16)
    set(gca,'fontsize',12,'linewidth',2);
    title('Molecular Orbital Coefficients')
    
end