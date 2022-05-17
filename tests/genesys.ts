import ShdwDrive from "@shadow-drive/sdk";
import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import fs from "fs";
import {Wallet} from "@project-serum/anchor";
import FormData from "form-data";

const walletPath = "/Users/ohaddahan/./.config/solana/id.json";

function loadWalletKey(keypair: string): Keypair {
    if (!keypair || keypair == '') {
        throw new Error('Keypair is required!');
    }
    const loaded = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString())),
        // new Uint8Array(JSON.parse(keypair)),
    );
    console.log(`wallet public key: ${loaded.publicKey}`);
    return loaded;
}

async function main() {
    // const connection = new Connection("https://ssc-dao.genesysgo.net/");
    // const wallet = new Wallet(loadWalletKey(walletPath));
    //
    // const drive = await new ShdwDrive(connection, wallet).init();
    // const storageAcc = await drive.createStorageAccount("NFT-test", "1MB");
    // const acc = new PublicKey(storageAcc.shdw_bucket);
    // const getStorageAccount = await drive.getStorageAccount(acc);
    // console.log(getStorageAccount);
    //
    // const files = ["test_level_0.json", "test_level_1.json"];
    // for (const file of files) {
    //     const form = new FormData();
    //     form.append(file, fs.readFileSync(`tests/${file}`).toString() );
    //     const resp = await drive.uploadFile(acc, form);
    //     console.log(`resp:\n${JSON.stringify(resp, null, 2)}`);
    // }
}

main().then(() => console.log(""))