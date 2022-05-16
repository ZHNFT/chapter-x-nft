/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import { UnstakeArgs, unstakeArgsBeet } from '../types/UnstakeArgs'

/**
 * @category Instructions
 * @category Unstake
 * @category generated
 */
export type UnstakeInstructionArgs = {
  args: UnstakeArgs
}
/**
 * @category Instructions
 * @category Unstake
 * @category generated
 */
const unstakeStruct = new beet.BeetArgsStruct<
  UnstakeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', unstakeArgsBeet],
  ],
  'UnstakeInstructionArgs'
)
/**
 * Accounts required by the _unstake_ instruction
 *
 * @property [_writable_, **signer**] owner
 * @property [_writable_] book
 * @property [_writable_] bookTokenAccount
 * @property [] mint
 * @property [_writable_] ownerTokenAccount
 * @property [] associatedTokenProgram
 * @category Instructions
 * @category Unstake
 * @category generated
 */
export type UnstakeInstructionAccounts = {
  owner: web3.PublicKey
  book: web3.PublicKey
  bookTokenAccount: web3.PublicKey
  mint: web3.PublicKey
  ownerTokenAccount: web3.PublicKey
  associatedTokenProgram: web3.PublicKey
}

const unstakeInstructionDiscriminator = [90, 95, 107, 42, 205, 124, 50, 225]

/**
 * Creates a _Unstake_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Unstake
 * @category generated
 */
export function createUnstakeInstruction(
  accounts: UnstakeInstructionAccounts,
  args: UnstakeInstructionArgs
) {
  const {
    owner,
    book,
    bookTokenAccount,
    mint,
    ownerTokenAccount,
    associatedTokenProgram,
  } = accounts

  const [data] = unstakeStruct.serialize({
    instructionDiscriminator: unstakeInstructionDiscriminator,
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
