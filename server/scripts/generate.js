const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp.utils.randomPrivateKey();

console.log('private key: ', toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);

console.log('public key: ', toHex(publicKey));

const slicedPublicKey = publicKey.slice(1, publicKey.length);
const keccakHash = keccak256(slicedPublicKey);
const address = keccakHash.slice(-20);

console.log('Eth address: ', toHex(address));