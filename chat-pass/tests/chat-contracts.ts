import BN from "bn.js";
import {
  Connection,
  sendAndConfirmTransaction,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";

const main = async () => {
  var args = process.argv.slice(2);
  // args[0]: Program ID
  // args[1] (Optional): Counter buffer account
  const programId = new PublicKey(args[0]);

  console.log(programId.toBase58());
  const connection = new Connection("http://127.0.0.1:8899");
  // const connection = new Connection("https://api.devnet.solana.com/");
  const feePayer = new Keypair();

  console.log("Requesting Airdrop of 1 SOL...");
  await connection.requestAirdrop(feePayer.publicKey, 2e9);
  console.log("Airdrop received");

  const counter = new Keypair();
  let counterKey = counter.publicKey;
  let tx = new Transaction();
  let signers = [feePayer];
  if (args.length > 1) {
    console.log("Found counter address");
    counterKey = new PublicKey(args[1]);
  } else {
    console.log("Generating new counter address");
    let createIx = SystemProgram.createAccount({
      fromPubkey: feePayer.publicKey,
      newAccountPubkey: counterKey,
      /** Amount of lamports to transfer to the created account */
      lamports: await connection.getMinimumBalanceForRentExemption(8),
      /** Amount of space in bytes to allocate to the created account */
      space: 8,
      /** Public key of the program to assign as the owner of the created account */
      programId: programId,
    });
    signers.push(counter);
    tx.add(createIx);
  }

  const idx = Buffer.from(new Uint8Array([0]));

  let incrIx = new TransactionInstruction({
    keys: [
      {
        pubkey: counterKey,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId: programId,
    data: idx,
  });
  /*
    TransactionInstruction({
      keys: Array<AccountMeta>,
      programId: PublicKey,
      data: Buffer,
    });
  */
  tx.add(incrIx);

  let txid = await sendAndConfirmTransaction(connection, tx, signers, {
    skipPreflight: true,
    preflightCommitment: "confirmed",
    commitment: "finalized",
  });
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

  const counterAccount = await connection.getAccountInfo(counterKey);
  const count = new BN(counterAccount.data, "le");
  console.log("Counter Key:", counterKey.toBase58());
  console.log("Count: ", count.toNumber());
};

const testInit = async () => {
  var args = process.argv.slice(2);
  // args[0]: Program ID
  // args[1] (Optional): Counter buffer account
  const programId = new PublicKey(args[0]);

  console.log(programId.toBase58());
  const connection = new Connection("http://127.0.0.1:8899");
  // const connection = new Connection("https://api.devnet.solana.com/");
  const feePayer = new Keypair();

  console.log("Requesting Airdrop of 1 SOL...");
  await connection.requestAirdrop(feePayer.publicKey, 2e9);
  console.log("Airdrop received");

  const chatAccount = new Keypair();
  let chatAccountKey = chatAccount.publicKey;
  let tx = new Transaction();
  let signers = [feePayer, chatAccount];

  const idx = Buffer.from(new Uint8Array([1]));

  let incrIx = new TransactionInstruction({
    keys: [
      {
        pubkey: feePayer.publicKey,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: chatAccountKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: programId,
    data: idx,
  });
  tx.add(incrIx);

  let txid = await sendAndConfirmTransaction(connection, tx, signers, {
    skipPreflight: true,
    preflightCommitment: "confirmed",
    commitment: "finalized",
  });
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

  const chatAccountFetched = await connection.getAccountInfo(chatAccountKey);
  const data = new BN(chatAccountFetched.data, "le");
  console.log("Chat Account:", chatAccountKey.toBase58());
  console.log("Chat Account Data:", data.toArray());
};

const testBuyPass = async () => {
  var args = process.argv.slice(2);
  // args[0]: Program ID
  // args[1] (Optional): Counter buffer account
  const programId = new PublicKey(args[0]);

  console.log(programId.toBase58());
  const connection = new Connection("http://127.0.0.1:8899");
  // const connection = new Connection("https://api.devnet.solana.com/");
  const feePayer = new Keypair();

  console.log("Requesting Airdrop of 1 SOL...");
  await connection.requestAirdrop(feePayer.publicKey, 2e9);
  console.log("Airdrop received");

  let tx = new Transaction();
  const chatAccount = new Keypair();
  let chatAccountKey = chatAccount.publicKey;
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: feePayer.publicKey,
    newAccountPubkey: chatAccountKey,
    /** Amount of lamports to transfer to the created account */
    lamports: await connection.getMinimumBalanceForRentExemption(500),
    /** Amount of space in bytes to allocate to the created account */
    space: 500,
    /** Public key of the program to assign as the owner of the created account */
    programId: programId,
  });
  console.log("Chat account created");
  tx.add(createAccountIx);

  const idx = Buffer.from(new Uint8Array([2]));

  let signers = [feePayer, chatAccount];

  let incrIx = new TransactionInstruction({
    keys: [
      {
        pubkey: feePayer.publicKey,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: chatAccount.publicKey,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId: programId,
    data: idx,
  });
  tx.add(incrIx);

  let txid = await sendAndConfirmTransaction(connection, tx, signers, {
    skipPreflight: true,
    preflightCommitment: "confirmed",
    commitment: "finalized",
  });
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);

  const chatAccountFetched = await connection.getAccountInfo(chatAccountKey);
  const data = new BN(chatAccountFetched.data, "le");
  console.log("Chat Account:", chatAccountKey.toBase58());
  console.log("Chat Account Data:", data.toArray());
  console.log("Chat Account Balance:", chatAccountFetched.lamports);
};

testBuyPass()
  .then(() => {
    console.log("Success");
  })
  .catch((e) => {
    console.error(e);
  });
