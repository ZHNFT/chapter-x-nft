/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
export type CreateConfigArgs = {
  stakePeriodInSecs: beet.bignum
  stakeLock: boolean
}

/**
 * @category userTypes
 * @category generated
 */
export const createConfigArgsBeet = new beet.BeetArgsStruct<CreateConfigArgs>(
  [
    ['stakePeriodInSecs', beet.u64],
    ['stakeLock', beet.bool],
  ],
  'CreateConfigArgs'
)
