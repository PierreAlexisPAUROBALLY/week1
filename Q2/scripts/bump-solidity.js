const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/
const verifierRegex = /contract Verifier/
/*
let content = fs.readFileSync("./contracts/HelloWorldVerifier.sol", { encoding: 'utf-8' });
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
bumped = bumped.replace(verifierRegex, 'contract HelloWorldVerifier');

fs.writeFileSync("./contracts/HelloWorldVerifier.sol", bumped);
*/
// [assignment] add your own scripts below to modify the other verifier contracts you will build during the assignment


function bumper(filename) {
    let content = fs.readFileSync("./contracts/" + filename + ".sol", { encoding: 'utf-8' });
    let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.0');
    bumped = bumped.replace(verifierRegex, 'contract ' + filename);
    fs.writeFileSync("./contracts/" + filename + ".sol", bumped);
}
//bumper("HelloWorldVerifier")
//bumper("Multiplier3groth16Verifier")

//bumper("Multiplier3plonkVerifier") doesnt work for plonk


function bumperPlonk(filename) {
    let content = fs.readFileSync("./contracts/" + filename + ".sol", { encoding: 'utf-8' });
    let bumped = content.replace("pragma solidity >=0.7.0 <0.9.0", 'pragma solidity ^0.8.0');
    bumped = bumped.replace("contract PlonkVerifier", 'contract ' + filename);
    fs.writeFileSync("./contracts/" + filename + ".sol", bumped);
}

bumperPlonk("Multiplier3plonkVerifier")