import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { ChapterXNft } from "../target/types/chapter_x_nft";

describe("chapter-x-nft", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.ChapterXNft as Program<ChapterXNft>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
