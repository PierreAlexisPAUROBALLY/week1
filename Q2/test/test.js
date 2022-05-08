const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");
//const {plonk} = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof (o) == "string") && (/^[0-9]+$/.test(o))) {
        return BigInt(o);
    } else if ((typeof (o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o))) {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o === null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach((k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {

        //generate a groth16 proof from input, publicsignals is the output of the circuit (an array here only 1 output)
        // proof is the proof that the circuit has not been tampered with / that we are an honest prover
        const { proof, publicSignals } = await groth16.fullProve({ "a": "3", "b": "6" }, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm", "contracts/circuits/HelloWorld/circuit_final.zkey");

        console.log('result is', publicSignals[0]);

        // turn our string bigints into numbers
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);

        // export our proof and signal to the calldata variable
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);

        // parse our calldata into a format that can be used to call the smart contract and separate each argument
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];

        const Input = argv.slice(8);
        // call the HelloWolrd solidity contract to see if the proof is correct
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });



    it("Should return false for invalid proof", async function () {
        // generate false input data
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        // generate public result
        let d = [0]
        // this shouldnt be a valid proof since we just created that data
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});



describe("Multiplier3 with Groth16", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Multiplier3groth16Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();

    });

    it("Should return true for correct proof", async function () {
        const { proof, publicSignals } = await groth16.fullProve({ "a": "1", "b": "2", "c": "6" }, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/Multiplier3/circuit_final.zkey");
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
        console.log('result is', publicSignals[0]);

        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;


    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        // generate public result
        let d = [0]
        // this shouldnt be a valid proof since we just created that data

        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {
    let Verifier;
    let verifier;


    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3plonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        const { proof, publicSignals } = await plonk.fullProve({ "a": "1", "b": "2", "c": "3" }, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm", "contracts/circuits/Multiplier3_plonk/circuit_final.zkey");
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
        console.log('result is', publicSignals[0]);

        const argv = calldata.split(',')
        arg0 = argv[0]
        const Input = argv[1].replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString())


        expect(await verifier.verifyProof(value = arg0, Input)).to.be.true; // Error: invalid arrayify value (argument="value", value="0", code=INVALID_ARGUMENT, version=bytes/5.6.1)


    });
    it("Should return false for invalid proof", async function () {
        expect(await verifier.verifyProof(value = '0x00', ['0'])).to.be.false;
    });
});


