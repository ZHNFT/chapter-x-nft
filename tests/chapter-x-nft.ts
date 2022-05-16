import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { ChapterXNft } from "../target/types/chapter_x_nft";
import {Keypair} from "@solana/web3.js";
import {keypairIdentity, Metaplex} from "@metaplex-foundation/js-next";
import { Amman } from '@metaplex-foundation/amman';
import {mintToChecked} from "@solana/spl-token";
import {mintToReceiver} from "./mint-to-receiver";

export const amman = Amman.instance({
  knownLabels: { "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s": 'Token Metadata' },
});

describe("chapter-x-nft", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const AIRDROP_AMOUNT = 5_000_000;
  const program = anchor.workspace.ChapterXNft as Program<ChapterXNft>;
  const metaplex = new Metaplex(program.provider.connection);
  const creator = Keypair.generate();
  const owner = Keypair.generate()
  metaplex.use(keypairIdentity(creator));

  it("Airdrop", async () => {
    const t1 = await program.provider.connection.requestAirdrop(creator.publicKey, AIRDROP_AMOUNT);
    await program.provider.connection.confirmTransaction(t1, "confirmed");
    const t2 = await program.provider.connection.requestAirdrop(owner.publicKey, AIRDROP_AMOUNT);
    await program.provider.connection.confirmTransaction(t2, "confirmed");
  });

  it("Mint", async() => {
    const { nft } = await metaplex.nfts().create({
      uri: "https://w2pee5mmvvsptyjsqc5m7r63p2s5xsxutag3fsntvikv2fqm.arweave.net/tp5CdYy-tZPnhMoC6z8fbfqXbyvSYDbLJs6_-oVXRYM",
      name: "Test NFT"
    });
    console.log(`NFT:\n${JSON.stringify(nft, null, 2)}`)
    //
    // await mintToReceiver(program.provider.connection, creator, owner.publicKey);

  })
});
