import { expect } from "chai";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { ChatContracts } from "../target/types/chat_contracts";

describe("chat-contracts", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ChatContracts as Program<ChatContracts>;

  it("Is initialized!", async () => {
    // Add your test here.
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
    expect(gameState.users).to.be.a('array');
    expect(gameState.users).to.have.length(0);
  });
});
