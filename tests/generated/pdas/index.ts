import {PublicKey} from "@solana/web3.js";
import {PROGRAM_ID} from "../index";
import {BOOK_PREFIX, BOOK_VAULT_PREFIX} from "../constants";

export async function getBook(mint: PublicKey, owner: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
            Buffer.from(anchor.utils.bytes.utf8.encode(BOOK_PREFIX)),
            mint.toBuffer(),
            owner.toBuffer()
        ],
        PROGRAM_ID);
}

export async function getBookTokenAccount(mint: PublicKey, owner: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
            Buffer.from(anchor.utils.bytes.utf8.encode(BOOK_VAULT_PREFIX)),
            mint.toBuffer(),
            owner.toBuffer()
        ],
        PROGRAM_ID);
}