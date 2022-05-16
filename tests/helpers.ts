import {Connection, Keypair, Transaction, TransactionInstruction, SignatureResult} from "@solana/web3.js";

export declare type TxnResult = {
    Signature: string;
    SignatureResult: SignatureResult;
};

export async function processTransaction(
    instructions: TransactionInstruction[],
    connection: Connection,
    payer: Keypair
): Promise<TxnResult> {
    const tx = new Transaction();
    instructions.map((i) => tx.add(i));
    tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    const sig = await connection.sendRawTransaction(tx.serialize(), {
        maxRetries: 3,
        preflightCommitment: "confirmed",
        skipPreflight: true,
    });
    const result = await connection.confirmTransaction(sig, "confirmed");
    return {
        Signature: sig,
        SignatureResult: result.value,
    };
}
