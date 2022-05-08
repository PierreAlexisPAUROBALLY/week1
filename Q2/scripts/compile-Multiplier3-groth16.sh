#!/bin/bash

# [assignment] create your own bash script to compile Multipler3.circom modeling after compile-Multiplier3.sh below#!/bin/bash

cd contracts/circuits

mkdir Multiplier3

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Multiplier3.circom..."

# compile circuit
circom Multiplier3.circom --r1cs --wasm --sym -o Multiplier3

# snarkjs r1cs info Multiplier3/Multiplier3.r1cs 
#gives informations on the circuit: number of wires,constraints,pub&priv inputs,labels.

# snarkjs r1cs print Multiplier3/Multiplier3.r1cs Multiplier3/Multiplier3.sym 
#prints the constraints





# Start a new zkey and make a contribution
#groth16 requires a trusted ceremony for a new circuit (not safe without),
# so we create a zkey(zkkey that includes provingkey, verificationkey from the powersOfTau & phase 2 contributions) 
#for the specific circuit and then add randomness (phase 2 contribution)
snarkjs groth16 setup Multiplier3/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3/circuit_0000.zkey
snarkjs zkey contribute Multiplier3/circuit_0000.zkey Multiplier3/circuit_final.zkey --name="1st Contributor Name" -v -e="random text" 
#here in production, we should use real randomness, if the input is discovered, fake proofs can be created
#verify the zkey
snarkjs zkey verify Multiplier3/Multiplier3.r1cs powersOfTau28_hez_final_10.ptau Multiplier3/circuit_final.zkey


snarkjs zkey export verificationkey Multiplier3/circuit_final.zkey Multiplier3/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Multiplier3/circuit_final.zkey ../Multiplier3groth16Verifier.sol

cd ../..

#cd contracts/circuits/Multiplier3
#node ./Multiplier3_js/generate_witness.js Multiplier3_js/Multiplier3.wasm input.json witness.wtns
#generates witness for inputs in input.json












