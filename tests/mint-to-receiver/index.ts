
import {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL, TransactionInstruction
} from "@solana/web3.js";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    MintLayout,
    getAssociatedTokenAddress,
    createInitializeMintInstruction,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction,
} from "@solana/spl-token";
import {
    Data,
    Creator,
    CreateMetadataArgs,
    CreateMasterEditionArgs,
    METADATA_SCHEMA as SERIALIZE_SCHEMA
} from "./schema";
import { serialize } from "borsh";
import {
    createMetadataInstruction,
    createMasterEditionInstruction
} from "./utils";
import BN from "bn.js";
import fs from "fs";
import {Key} from "@metaplex-foundation/mpl-token-metadata";

const METAPLEX_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export function loadWalletKey(keypair: string): Keypair {
    if (!keypair || keypair == '') {
        throw new Error('Keypair is required!');
    }
    const loaded = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString())),
    );
    return loaded;
}

export async function mintToReceiver(connection: Connection, creator: Keypair, user: PublicKey) {
    const creators = [
        new Creator({
            address: creator.publicKey.toString(),
            share: 100,
            verified: 1
        })
    ];

    const data = new Data({
        symbol: "SMB",
        name: "SMB Test",
        uri: "https://w2pee5mmvvsptyjsqc5m7r63p2s5xsxutag3fsntvikv2fqm.arweave.net/tp5CdYy-tZPnhMoC6z8fbfqXbyvSYDbLJs6_-oVXRYM",
        sellerFeeBasisPoints: 100,
        creators
    });

    await mintNFT(connection, creator, user, data);
}

async function mintNFT(
    connection: Connection,
    creator: Keypair,
    user: PublicKey,
    data: Data
): Promise<void> {
    const mint = new Keypair();

    // Allocate memory for the account
    const mintRent = await connection.getMinimumBalanceForRentExemption(
        MintLayout.span
    );

    // Create mint account
    const createMintAccountIx = SystemProgram.createAccount({
        fromPubkey: creator.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports: mintRent,
        space: MintLayout.span,
        programId: TOKEN_PROGRAM_ID
    });

    // Initalize mint ix
    // Creator keypair is mint and freeze authority
    const initMintIx = createInitializeMintInstruction(
        mint.publicKey,
        0,
        creator.publicKey,
        null,
        TOKEN_PROGRAM_ID
    );

    // Derive associated token account for user
    const assoc = await getAssociatedTokenAddress(
        mint.publicKey,
        user,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,


    );

    // Create associated account for user
    const createAssocTokenAccountIx =
        createAssociatedTokenAccountInstruction(
            creator.publicKey,
            assoc,
            user,
            mint.publicKey,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
        );

    // Create mintTo ix; mint to user's associated account
    const mintToIx = createMintToInstruction(
        mint.publicKey,
        assoc,
        creator.publicKey, // Mint authority
        1,
        [], // No multi-sign signers
        TOKEN_PROGRAM_ID,
    );

    // Derive metadata account
    const metadataSeeds = [
        Buffer.from("metadata"),
        METAPLEX_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer()
    ];
    const [metadataAccount, _pda] = await PublicKey.findProgramAddress(
        metadataSeeds,
        METAPLEX_PROGRAM_ID
    );

    // Derive Master Edition account
    const masterEditionSeeds = [
        Buffer.from("metadata"),
        METAPLEX_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
        Buffer.from("edition")
    ];
    const [masterEditionAccount, _] = await PublicKey.findProgramAddress(
        masterEditionSeeds,
        METAPLEX_PROGRAM_ID
    );

    let buffer = Buffer.from(
        serialize(
            SERIALIZE_SCHEMA,
            new CreateMetadataArgs({ data, isMutable: true })
        )
    );

    // Create metadata account ix
    const createMetadataIx = createMetadataInstruction(
        metadataAccount,
        mint.publicKey,
        creator.publicKey,
        creator.publicKey,
        creator.publicKey,
        buffer
    );

    buffer = Buffer.from(
        serialize(
            SERIALIZE_SCHEMA,
            new CreateMasterEditionArgs({ maxSupply: new BN(0) })
        )
    );

    const createMasterEditionIx = createMasterEditionInstruction(
        metadataAccount,
        masterEditionAccount,
        mint.publicKey,
        creator.publicKey,
        creator.publicKey,
        creator.publicKey,
        buffer
    );

    const memo = new TransactionInstruction({
        keys: [{ pubkey: creator.publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from('Data to send in transaction', 'utf-8'),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    })

    let tx = new Transaction()
        .add(createMintAccountIx)
        .add(initMintIx)
        .add(createAssocTokenAccountIx)
        .add(mintToIx)
        .add(createMetadataIx)
        .add(createMasterEditionIx)
        .add(memo);

    const recent = await connection.getRecentBlockhash();
    tx.recentBlockhash = recent.blockhash;
    tx.feePayer = creator.publicKey;

    tx.sign(mint, creator);

    const txSignature = await connection.sendRawTransaction(tx.serialize());

    console.log(txSignature);
}

