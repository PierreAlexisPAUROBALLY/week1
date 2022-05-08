pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
include "../../node_modules/circomlib-matrix/circuits/matMul.circom"; // calc A*x
include "../../node_modules/circomlib/circuits/comparators.circom";
// we want to verif that Ax =b

// calc Ax =>  Axmb=Ax-b => if all elemnts of Axmb ==0 => solution found

template Add2(){
    signal input in1;
    signal input in2;
    signal output out;
    out <== in1+in2;
}

template AddN(n){
    signal input in[n];
    signal output out;
    component comp[n-1];


    for ( var i=0;i<n-1;i++){
        comp[i] = Add2();
    }
    comp[0].in1 <==in[0];
    comp[0].in2 <==in[1];
    for(var i = 0; i < n-2; i++){
       comp[i+1].in1 <== comp[i].out;
       comp[i+1].in2 <== in[i+2];
    }
    out <== comp[n-2].out;

}






template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal  Ax[n]; 
    signal Axmb[n];// Ax - b
    signal iszArr[n];// array of 1 if Ax-b=0 (0 vector)
    

    signal output out;// 1 for correct solution

    //compute matmul, A*x =Ax
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


    // check if Ax - b =0 (vector) 
    //checking if all values ==0 (1 if the row substraction =0 , 0 else; we should have an array of 1 for a valid solution)
    component isZcheck[n];
    for (var i=0;i<n;i++) {
        Axmb[i]<==Ax[i] - b[i];
        isZcheck[i] = IsZero();

        isZcheck[i].in <== Axmb[i];
        iszArr[i] <== isZcheck[i].out;

    }
    // add the values of the vector 
    component AN=AddN(n);
      for (var i=0; i < n; i++) {
            AN.in[i] <== iszArr[i];       
    }

    signal addedisZ<==AN.out;
    // n-addedZ : n dimensional vector, if vector is 1, then n - the sum of the values of the vector = 0 if the solution is good
    signal nMinusAddedisZ <== n-addedisZ;
    // if the value is 0 => outputs 1 (we have the solution) else outputs 0 (we dont have the solution)
    component FinalCheck = IsZero();
    FinalCheck.in<==nMinusAddedisZ;
    out <== FinalCheck.out;














}





component main {public [A, b]} = SystemOfEquations(3);