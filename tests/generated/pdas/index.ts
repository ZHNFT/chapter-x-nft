import {PublicKey} from "@solana/web3.js";
import {PROGRAM_ID} from "../index";
import {BOOK_PREFIX, BOOK_VAULT_PREFIX, CONFIG_PREFIX} from "../constants";
import * as anchor from "@project-serum/anchor";

export async function getBook(mint: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
            Buffer.from(anchor.utils.bytes.utf8.encode(BOOK_PREFIX)),
            mint.toBuffer()
        ],
        PROGRAM_ID);
}

export async function getBookTokenAccount(mint: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
            Buffer.from(anchor.utils.bytes.utf8.encode(BOOK_VAULT_PREFIX)),
            mint.toBuffer()
        ],
        PROGRAM_ID);
}

export async function getConfig(): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
            Buffer.from(anchor.utils.bytes.utf8.encode(CONFIG_PREFIX)),
        ],
        PROGRAM_ID);
}