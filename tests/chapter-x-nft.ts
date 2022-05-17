import * as anchor from "@project-serum/anchor";
import {BN, Program} from "@project-serum/anchor";
import { ChapterXNft } from "../target/types/chapter_x_nft";
import {Connection, Keypair, TransactionInstruction} from "@solana/web3.js";
import {keypairIdentity, Metaplex, Nft} from "@metaplex-foundation/js-next";
import { Amman } from '@metaplex-foundation/amman';
import {getBook, getBookTokenAccount, getConfig} from "./generated/pdas";
import {
  Book,
  BooksConfig,
  CreateConfigInstructionAccounts,
  CreateConfigInstructionArgs,
  createCreateConfigInstruction, createStakeInstruction, createUnstakeInstruction, StakeInstructionAccounts,
  StakeInstructionArgs, UnstakeInstructionAccounts, UnstakeInstructionArgs
} from "./generated";
import {assert} from "chai";
import {processTransaction, sleep} from "./helpers";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  transferChecked
} from "@solana/spl-token";
import { LOCALHOST } from '@metaplex-foundation/amman';
import web3 from "@solana/web3.js";

export const amman = Amman.instance({
  knownLabels: { "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s": 'Token Metadata' },
});

describe("chapter-x-nft", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const connection = new Connection(LOCALHOST, "confirmed");
  const AIRDROP_AMOUNT = 5_000_000_000;
  const program = anchor.workspace.ChapterXNft as Program<ChapterXNft>;
  const metaplex = new Metaplex(connection);
  const creator = Keypair.generate();
  const owner = Keypair.generate()
  let stakePeriodInSecs: number = 30;
  let newNft: Nft;
  metaplex.use(keypairIdentity(creator));

  const file_0 = "https://gist.githubusercontent.com/ohaddahan/c9061d5b87b8cf457982c40bb341c13c/raw/79c5b0880a72a32a99059258db714a5122db27f9/test_level_0.json";
  const file_1 = "https://gist.githubusercontent.com/ohaddahan/c9061d5b87b8cf457982c40bb341c13c/raw/79c5b0880a72a32a99059258db714a5122db27f9/test_level_1.json";

  it("Airdrop", async () => {
    const t1 = await connection.requestAirdrop(creator.publicKey, AIRDROP_AMOUNT);
    await connection.confirmTransaction(t1, "confirmed");
    const t2 = await connection.requestAirdrop(owner.publicKey, AIRDROP_AMOUNT);
    await connection.confirmTransaction(t2, "confirmed");
  });

  it("Mint", async() => {
    const { nft } = await metaplex.nfts().create({
      uri: file_0,
      name: "Test NFT",
      isMutable: true,
      creators: [
        {
          address: creator.publicKey,
          share: 100,
          verified: false
        }
      ],
      confirmOptions: {
        skipPreflight: true
      }
    });
    newNft = nft;
  })

  it("Create Config", async () => {
    const [config] = await getConfig();
    const args: CreateConfigInstructionArgs = {
      args: {
        stakePeriodInSecs: new BN(stakePeriodInSecs)
      }
    };

    const accounts: CreateConfigInstructionAccounts = {
      owner: creator.publicKey,
      config: config
    }

    const instruction = createCreateConfigInstruction(accounts, args);
    const sig = await processTransaction([instruction], connection, creator);
    assert(sig.SignatureResult.err === null, `Create Config failed , check ${sig.Signature}`);
    const configAccount = await BooksConfig.fromAccountAddress(connection, config);
    assert(configAccount.pretty().stakePeriodInSecs == stakePeriodInSecs, `Wrong config data =>\n${JSON.stringify(configAccount.pretty(), null, 2)}`);
  })

  it("Transfer NFT", async () => {
    const creatorTokenAccount = await getOrCreateAssociatedTokenAccount(connection, creator, newNft.mint, creator.publicKey);
    const ownerTokenAccount = await getOrCreateAssociatedTokenAccount(connection, owner, newNft.mint, owner.publicKey);

    await transferChecked(
        connection, // connection
        creator, // payer
        creatorTokenAccount.address, // from (should be a token account)
        newNft.mint, // mint
        ownerTokenAccount.address, // to (should be a token account)
        creator, // from's owner
        1, // amount, if your deciamls is 8, send 10^8 for 1 token
        0 // decimals
    );
  })

  it("Stake", async() => {
    const [book, bookNonce] = await getBook(newNft.mint);
    const [bookTokenAccount, bookTokenAccountNonce] = await getBookTokenAccount(newNft.mint);
    const ownerTokenAccount = await getAssociatedTokenAddress(newNft.mint, owner.publicKey);

    const args: StakeInstructionArgs = {
      args: {
        bookNonce: bookNonce,
        bookTokenAccountNonce: bookTokenAccountNonce
      }
    };

    const accounts: StakeInstructionAccounts = {
      owner: owner.publicKey,
      book: book,
      bookTokenAccount: bookTokenAccount,
      mint: newNft.mint,
      ownerTokenAccount: ownerTokenAccount,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    }

    const instruction = createStakeInstruction(accounts, args);
    const sig = await processTransaction([instruction], connection, owner);
    const txn = await connection.getParsedTransaction(sig.Signature, "confirmed");
    assert(sig.SignatureResult.err === null, txn.meta.logMessages.join("\n"));
    const bookAccount = await Book.fromAccountAddress(connection, book);
    assert(bookAccount.pretty().level === 0, `Book level unexpected ${book.toBase58()}\n${JSON.stringify(bookAccount.pretty(), null, 2)}`);
  })

  it("Unstake too early", async () => {
    const [config, configNonce] = await getConfig();
    const [book, bookNonce] = await getBook(newNft.mint);
    const [bookTokenAccount, bookTokenAccountNonce] = await getBookTokenAccount(newNft.mint);
    const ownerTokenAccount = await getAssociatedTokenAddress(newNft.mint, owner.publicKey);

    const nftAccount = await connection.getParsedAccountInfo(ownerTokenAccount);
    nftAccount.value.owner

    const args: UnstakeInstructionArgs = {
      args: {
        bookNonce: bookNonce,
        bookTokenAccountNonce: bookTokenAccountNonce,
        configNonce: configNonce
      }
    };

    const accounts: UnstakeInstructionAccounts = {
      owner: owner.publicKey,
      book: book,
      config: config,
      bookTokenAccount: bookTokenAccount,
      mint: newNft.mint,
      ownerTokenAccount: ownerTokenAccount,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    }

    const instruction = createUnstakeInstruction(accounts, args);
    const sig = await processTransaction([instruction], connection, owner);
    const txn = await connection.getParsedTransaction(sig.Signature, "confirmed");
    assert(sig.SignatureResult.err === null, txn.meta.logMessages.join("\n"));
    const bookAccount = await Book.fromAccountAddress(connection, book);
    assert(bookAccount.pretty().level === 0, `Book level unexpected ${book.toBase58()}\n${JSON.stringify(bookAccount.pretty(), null, 2)}`);
  })

  it("Re Stake", async() => {
    const [book, bookNonce] = await getBook(newNft.mint);
    const [bookTokenAccount, bookTokenAccountNonce] = await getBookTokenAccount(newNft.mint);
    const ownerTokenAccount = await getAssociatedTokenAddress(newNft.mint, owner.publicKey);

    const args: StakeInstructionArgs = {
      args: {
        bookNonce: bookNonce,
        bookTokenAccountNonce: bookTokenAccountNonce
      }
    };

    const accounts: StakeInstructionAccounts = {
      owner: owner.publicKey,
      book: book,
      bookTokenAccount: bookTokenAccount,
      mint: newNft.mint,
      ownerTokenAccount: ownerTokenAccount,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    }

    const instruction = createStakeInstruction(accounts, args);
    const sig = await processTransaction([instruction], connection, owner);
    const txn = await connection.getParsedTransaction(sig.Signature, "confirmed");
    assert(sig.SignatureResult.err === null, txn.meta.logMessages.join("\n"));

    const bookAccount = await Book.fromAccountAddress(connection, book);
    assert(bookAccount.pretty().level === 0, `Book level unexpected ${book.toBase58()}\n${JSON.stringify(bookAccount.pretty(), null, 2)}`);
  })

  it("Unstake after", async () => {
    const [config, configNonce] = await getConfig();
    const [book, bookNonce] = await getBook(newNft.mint);
    const [bookTokenAccount, bookTokenAccountNonce] = await getBookTokenAccount(newNft.mint);
    const ownerTokenAccount = await getAssociatedTokenAddress(newNft.mint, owner.publicKey);
    await sleep(stakePeriodInSecs * 1000);

    const args: UnstakeInstructionArgs = {
      args: {
        bookNonce: bookNonce,
        bookTokenAccountNonce: bookTokenAccountNonce,
        configNonce: configNonce
      }
    };

    const accounts: UnstakeInstructionAccounts = {
      owner: owner.publicKey,
      book: book,
      config: config,
      bookTokenAccount: bookTokenAccount,
      mint: newNft.mint,
      ownerTokenAccount: ownerTokenAccount,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    }

    const instruction = createUnstakeInstruction(accounts, args);
    const sig = await processTransaction([instruction], connection, owner);
    const txn = await connection.getParsedTransaction(sig.Signature, "confirmed");
    assert(sig.SignatureResult.err === null, txn.meta.logMessages.join("\n"));

    await sleep(3000);

    const bookAccount = await Book.fromAccountAddress(connection, book);
    assert(bookAccount.pretty().level === 1, `Book level unexpected ${book.toBase58()}\n${JSON.stringify(bookAccount.pretty(), null, 2)}`);

    const beforeNft = await metaplex.nfts().findByMint(newNft.mint);
    const { nft } = await metaplex.nfts().update(beforeNft, { uri: file_1 });
    assert(beforeNft.uri === file_0, "beforeNft URI mismatch");
    assert(nft.uri === file_1, "afterNft URI mismatch");
  })
});
