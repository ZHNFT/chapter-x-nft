/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * Arguments used to create {@link BooksConfig}
 * @category Accounts
 * @category generated
 */
export type BooksConfigArgs = {
  owner: web3.PublicKey
  stakePeriodInSecs: beet.bignum
  stakeLock: boolean
}

const booksConfigDiscriminator = [147, 214, 233, 27, 135, 187, 223, 108]
/**
 * Holds the data for the {@link BooksConfig} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class BooksConfig implements BooksConfigArgs {
  private constructor(
    readonly owner: web3.PublicKey,
    readonly stakePeriodInSecs: beet.bignum,
    readonly stakeLock: boolean
  ) {}

  /**
   * Creates a {@link BooksConfig} instance from the provided args.
   */
  static fromArgs(args: BooksConfigArgs) {
    return new BooksConfig(args.owner, args.stakePeriodInSecs, args.stakeLock)
  }

  /**
   * Deserializes the {@link BooksConfig} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [BooksConfig, number] {
    return BooksConfig.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link BooksConfig} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey
  ): Promise<BooksConfig> {
    const accountInfo = await connection.getAccountInfo(address)
    if (accountInfo == null) {
      throw new Error(`Unable to find BooksConfig account at ${address}`)
    }
    return BooksConfig.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Deserializes the {@link BooksConfig} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [BooksConfig, number] {
    return booksConfigBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link BooksConfig} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return booksConfigBeet.serialize({
      accountDiscriminator: booksConfigDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link BooksConfig}
   */
  static get byteSize() {
    return booksConfigBeet.byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link BooksConfig} data from rent
   *
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      BooksConfig.byteSize,
      commitment
    )
  }

  /**
   * Determines if the provided {@link Buffer} has the correct byte size to
   * hold {@link BooksConfig} data.
   */
  static hasCorrectByteSize(buf: Buffer, offset = 0) {
    return buf.byteLength - offset === BooksConfig.byteSize
  }

  /**
   * Returns a readable version of {@link BooksConfig} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      owner: this.owner.toBase58(),
      stakePeriodInSecs: (() => {
        const x = <{ toNumber: () => number }>this.stakePeriodInSecs
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      stakeLock: this.stakeLock,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const booksConfigBeet = new beet.BeetStruct<
  BooksConfig,
  BooksConfigArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['owner', beetSolana.publicKey],
    ['stakePeriodInSecs', beet.u64],
    ['stakeLock', beet.bool],
  ],
  BooksConfig.fromArgs,
  'BooksConfig'
)
