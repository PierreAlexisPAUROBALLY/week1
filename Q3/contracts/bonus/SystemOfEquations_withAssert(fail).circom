pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matMul.circom"; // calc A*x
include "../../node_modules/circomlib/circuits/comparators.circom";
// we want to verif that Ax =b

// calc Ax =>  Axmb=Ax-b => if all elemnts of Axmb ==0 => solution found

template IsZero() {
    signal input in;
    signal output out;

    signal inv;

    inv <-- in!=0 ? 1/in : 0;

    out <== -in*inv +1;
    in*out === 0;
}


template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal  Ax[n]; 
    signal Axmb[n];// Ax - b
    signal output out;// 1 for correct solution

    component comp=matMul(n,n,1);

        for (var i=0; i < n; i++) {
        for (var j=0; j < n; j++) {
            comp.a[i][j] <== A[i][j];
        }
    }
    
    for (var i=0; i < n; i++) {
            comp.b[i][0] <== x[i];       
    }
    for (var i=0; i < n; i++) {
            Ax[i] <== comp.out[i][0];
        }




    for (var i=0;i<n;i++) {
        Axmb[i]<==Ax[i] - b[i];

    }

    for (var i=0;i<n;i++){
            assert(Axmb[i] == 0);
    }
    out <==1;
}






component main {public [A, b]} = SystemOfEquations(4);
