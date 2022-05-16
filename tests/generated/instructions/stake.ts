/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { StakeArgs, stakeArgsBeet } from '../types/StakeArgs'

/**
 * @category Instructions
 * @category Stake
 * @category generated
 */
export type StakeInstructionArgs = {
  args: StakeArgs
}
/**
 * @category Instructions
 * @category Stake
 * @category generated
 */
const stakeStruct = new beet.BeetArgsStruct<
  StakeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', stakeArgsBeet],
  ],
  'StakeInstructionArgs'
)
/**
 * Accounts required by the _stake_ instruction
 *
 * @property [_writable_, **signer**] owner
 * @property [_writable_] book
 * @property [_writable_] bookTokenAccount
 * @property [] mint
 * @property [_writable_] ownerTokenAccount
 * @property [] associatedTokenProgram
 * @category Instructions
 * @category Stake
 * @category generated
 */
export type StakeInstructionAccounts = {
  owner: web3.PublicKey
  book: web3.PublicKey
  bookTokenAccount: web3.PublicKey
  mint: web3.PublicKey
  ownerTokenAccount: web3.PublicKey
  associatedTokenProgram: web3.PublicKey
}

const stakeInstructionDiscriminator = [206, 176, 202, 18, 200, 209, 179, 108]

/**
 * Creates a _Stake_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Stake
 * @category generated
 */
export function createStakeInstruction(
  accounts: StakeInstructionAccounts,
  args: StakeInstructionArgs
) {
  const {
    owner,
    book,
    bookTokenAccount,
    mint,
    ownerTokenAccount,
    associatedTokenProgram,
  } = accounts

  const [data] = stakeStruct.serialize({
    instructionDiscriminator: stakeInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: owner,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: book,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: bookTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: mint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: ownerTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: associatedTokenProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
  ]

  const ix = new web3.TransactionInstruction({
    programId: new web3.PublicKey(
      'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
    ),
    keys,
    data,
  })
  return ix
}