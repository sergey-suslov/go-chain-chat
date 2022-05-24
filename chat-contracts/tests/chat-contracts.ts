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
    await program.methods
      .initialize()
      .accounts({
        chatAccount: chatKeypair.publicKey,
      })
      .signers([chatKeypair])
      .rpc();
    // Add your test here.
    const user = (program.provider as anchor.AnchorProvider).wallet;
    console.log("Chat", chatKeypair.publicKey);
    console.log("User", user.publicKey);
    console.log("Buy");
    let programAccount = await program.provider.connection.getAccountInfo(
      program.programId
    );
    console.log("Program account", programAccount.lamports);
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

    programAccount = await program.provider.connection.getAccountInfo(
      program.programId
    );
    console.log("Program account", programAccount);
    tx = await program.methods
      .checkPass(user.publicKey)
      .accounts({
        chatAccount: chatKeypair.publicKey,
      })
      .signers([])
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
