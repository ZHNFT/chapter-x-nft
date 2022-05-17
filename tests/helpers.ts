import {Connection, Keypair, Transaction, TransactionInstruction, SignatureResult} from "@solana/web3.js";

export async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

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
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    const sig = await connection.sendRawTransaction(tx.serialize(), {
        maxRetries: 3,
        skipPreflight: true,
        preflightCommitment: "finalized"
    });

    let txn = null
    while (txn === null) {
        txn = await connection.getParsedTransaction(sig, "finalized");
        await sleep(1000);
    }

    console.log(`processTransaction: ${txn.meta.logMessages.join("\n")}`);
    const result = await connection.getSignatureStatus(sig);

    return {
        Signature: sig,
        SignatureResult: result.value
    };
}
