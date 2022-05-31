import { expect } from "chai";
import * as anchor from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";
import { ChatContracts } from "../target/types/chat_contracts";

describe("chat-contracts", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ChatContracts as Program<ChatContracts>;

  it("Is initialized!", async () => {
    const chatKeypair = anchor.web3.Keypair.generate();
    const tx = await program.methods
      .initialize()
      .accounts({
        chatAccount: chatKeypair.publicKey,
      })
      .signers([chatKeypair])
      .rpc();
    console.log("Your transaction signature", tx);

    let gameState = await program.account.chatAccount.fetch(
      chatKeypair.publicKey
    );
    expect(gameState.users).to.be.a("array");
    expect(gameState.users).to.have.length(0);
  });

  it.only("should return true", async () => {
    const chatKeypair = anchor.web3.Keypair.generate();
    const user = (program.provider as anchor.AnchorProvider).wallet;
    console.log("Chat", chatKeypair.publicKey);
    console.log("User", user.publicKey);
    let userAccount = await program.provider.connection.getAccountInfo(
      user.publicKey
    );
    let programAccount = await program.provider.connection.getAccountInfo(
      program.programId
    );
    console.log("User's lamports", userAccount.lamports);
    console.log("Program's lamports", programAccount.lamports);
    console.log("Initialize");
    await program.methods
      .initialize()
      .accounts({
        chatAccount: chatKeypair.publicKey,
      })
      .signers([chatKeypair])
      .rpc();
    // Add your test here.
    userAccount = await program.provider.connection.getAccountInfo(
      user.publicKey
    );
    programAccount = await program.provider.connection.getAccountInfo(
      program.programId
    );
    let chatAccount = await program.provider.connection.getAccountInfo(
      chatKeypair.publicKey
    );
    console.log("User's lamports", userAccount.lamports);
    console.log("Program's lamports", programAccount.lamports);
    console.log("Chat's lamports", chatAccount.lamports);
    console.log("Buy");
    let tx = await program.methods
      .buyPass(new BN(10000000))
      .accounts({
        chatAccount: chatKeypair.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();
    console.log("Your transaction signature", tx);

    let chatState = await program.account.chatAccount.fetch(
      chatKeypair.publicKey
    );
    expect(chatState.users).to.be.a("array");
    expect(chatState.users).to.have.length(1);
    expect(user.publicKey.equals(chatState.users[0].address)).to.be.true;

    userAccount = await program.provider.connection.getAccountInfo(
      user.publicKey
    );
    programAccount = await program.provider.connection.getAccountInfo(
      program.programId
    );
    chatAccount = await program.provider.connection.getAccountInfo(
      chatKeypair.publicKey
    );
    console.log("User's lamports", userAccount.lamports);
    console.log("Program's lamports", programAccount.lamports);
    console.log("Chat's lamports", chatAccount.lamports);
  });
});
