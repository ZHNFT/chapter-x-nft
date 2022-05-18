import * as anchor from "@project-serum/anchor";
import {BN, Program} from "@project-serum/anchor";
import { ChapterXNft } from "../target/types/chapter_x_nft";
import {Connection, Keypair } from "@solana/web3.js";
import {keypairIdentity, Metaplex, Nft} from "@metaplex-foundation/js-next";
import { Amman } from '@metaplex-foundation/amman';
import {getBook, getBookTokenAccount, getConfig} from "./generated/pdas";
import {
  Book,
  BooksConfig,
  CreateConfigInstructionAccounts,
  CreateConfigInstructionArgs,
  createCreateConfigInstruction, createEditConfigInstruction,
  createStakeInstruction,
  createUnstakeInstruction, EditConfigInstructionAccounts,
  EditConfigInstructionArgs,
  StakeInstructionAccounts,
  StakeInstructionArgs,
  UnstakeInstructionAccounts,
  UnstakeInstructionArgs
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
  let stake_lock = false;
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
        stakePeriodInSecs: new BN(stakePeriodInSecs),
        stakeLock: stake_lock
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
    await sleep(stakePeriodInSecs * 1.1 * 1000);

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

    await sleep(5000);

    const bookAccount = await Book.fromAccountAddress(connection, book);
    assert(bookAccount.pretty().level === 1, `Book level unexpected ${book.toBase58()}\n${JSON.stringify(bookAccount.pretty(), null, 2)}\n${txn.meta.logMessages.join("\n")}`);

    const beforeNft = await metaplex.nfts().findByMint(newNft.mint);
    const { nft } = await metaplex.nfts().update(beforeNft, { uri: file_1 });
    assert(beforeNft.uri === file_0, "beforeNft URI mismatch");
    assert(nft.uri === file_1, "afterNft URI mismatch");
  })

  it("Change to lock stake", async () => {
    const [config, configNonce] = await getConfig();
    const args1: EditConfigInstructionArgs = {
      args: {
        stakeLock: true,
        stakePeriodInSecs: new BN(stakePeriodInSecs * 3),
        bookConfigNone: configNonce
      }
    }

    const accounts1: EditConfigInstructionAccounts = {
      owner: creator.publicKey,
      config: config
    }

    const beforeConfig = await BooksConfig.fromAccountAddress(connection, config);
    assert(beforeConfig.pretty().stakeLock === false, `BEFORE: Expected config to be false\n${JSON.stringify(beforeConfig.pretty(), null, 2)}`);
    assert(beforeConfig.pretty().stakePeriodInSecs === stakePeriodInSecs, `BEFORE: Expected stake time to be different\n${JSON.stringify(beforeConfig.pretty(), null, 2)}`);

    const instruction1 = createEditConfigInstruction(accounts1, args1);
    const sig1 = await processTransaction([instruction1], connection, creator);
    const txn1 = await connection.getParsedTransaction(sig1.Signature, "confirmed");
    assert(sig1.SignatureResult.err === null, txn1.meta.logMessages.join("\n"));

    await sleep(5000);

    const afterConfig = await BooksConfig.fromAccountAddress(connection, config);
    assert(afterConfig.pretty().stakeLock === true, `AFTER: Expected config to be true\n${JSON.stringify(afterConfig.pretty(), null, 2)}`);
    assert(afterConfig.pretty().stakePeriodInSecs == 3 * stakePeriodInSecs, `AFTER: Expected stake time to be different:\n${JSON.stringify(afterConfig.pretty(), null, 2)}`);

    // Stake after locking"
    const [book, bookNonce] = await getBook(newNft.mint);
    const [bookTokenAccount, bookTokenAccountNonce] = await getBookTokenAccount(newNft.mint);
    const ownerTokenAccount = await getAssociatedTokenAddress(newNft.mint, owner.publicKey);

    const args2: StakeInstructionArgs = {
      args: {
        bookNonce: bookNonce,
        bookTokenAccountNonce: bookTokenAccountNonce
      }
    };

    const accounts2: StakeInstructionAccounts = {
      owner: owner.publicKey,
      book: book,
      bookTokenAccount: bookTokenAccount,
      mint: newNft.mint,
      ownerTokenAccount: ownerTokenAccount,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    }

    const instruction2 = createStakeInstruction(accounts2, args2);
    const sig2 = await processTransaction([instruction2], connection, owner);
    const txn2 = await connection.getParsedTransaction(sig2.Signature, "confirmed");
    assert(sig2.SignatureResult.err === null, txn2.meta.logMessages.join("\n"));
    const bookAccount2 = await Book.fromAccountAddress(connection, book);
    assert(bookAccount2.pretty().level === 1, `Book level unexpected ${book.toBase58()}\n${JSON.stringify(bookAccount2.pretty(), null, 2)}`);

    // Unstake while locked

    const args3: UnstakeInstructionArgs = {
      args: {
        bookNonce: bookNonce,
        bookTokenAccountNonce: bookTokenAccountNonce,
        configNonce: configNonce
      }
    };

    const accounts3: UnstakeInstructionAccounts = {
      owner: owner.publicKey,
      book: book,
      config: config,
      bookTokenAccount: bookTokenAccount,
      mint: newNft.mint,
      ownerTokenAccount: ownerTokenAccount,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    }

    const instruction3 = createUnstakeInstruction(accounts3, args3);
    const sig3 = await processTransaction([instruction3], connection, owner);
    const txn3 = await connection.getParsedTransaction(sig3.Signature, "confirmed");
    console.log(`Unstaking message: ${txn3.meta.logMessages.join("\n")}`);
    assert(txn3.meta.logMessages.join("\n").includes("Staking is locked"));
    const bookAccount3 = await Book.fromAccountAddress(connection, book);
    assert(bookAccount3.pretty().level === 1, `Book level unexpected ${book.toBase58()}\n${JSON.stringify(bookAccount3.pretty(), null, 2)}`);
  })
});
