const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const secp  = require('ethereum-cryptography/secp256k1')
const { toHex } = require('ethereum-cryptography/utils')

app.use(cors());
app.use(express.json());

const balances = {
  "041d6682fc6b0cd75cc11d5d014e5279b344b839e78d520cbf22f14c1e628d07ea8255079c482f8b6e973f86de36aef472cc7603fc8c1db7fc3d763a17d092fba7": 100,
  "04be5c3ac09600bfd65455a3b5612b724a28261b7038f961a6f9ab781a79dd7c002697bc41b13daa9f21b8fcfa2466e426253893011fc2db6165da494549d4ea56": 50,
  "04a51df34040c958743000bdb24853a0e73038adbbf1ea723ea2cd4bda473cb33c290cbf0d95ddab87eb8127a53f91a3af302d2591b0add6ee3c319e1882541763": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  console.log(address);
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { data, messageHash, sign } = req.body;

  const sender = data.sender;
  const amount = data.amount;

  setInitialBalance(data.sender);
  setInitialBalance(data.recipient);

  const isValid = isValidTransaction(messageHash,sign,sender)
  if(!isValid) {
    res.status(400).send({message: "Not a valid Sender"})
  }

  if (balances[sender] < data.amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    console.log(toHex(secp.getPublicKey(data.recipient)));
    balances[toHex(secp.getPublicKey(data.recipient))] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function isValidTransaction(messageHash, sign, sender) {
  const signature = Uint8Array.from(Object.values(sign[0]));
  const recoveryBit = sign[1];
  const recoveredPublicKey = secp.recoverPublicKey(messageHash, signature, recoveryBit);
  const isSigned = secp.verify(signature, messageHash, recoveredPublicKey);

  const isValidSender = (sender.toString() === toHex(recoveredPublicKey).toString()) ? true:false;

  if(isValidSender && isSigned) return true;

  return false;
}
