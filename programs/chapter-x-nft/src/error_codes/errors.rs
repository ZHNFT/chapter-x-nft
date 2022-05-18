use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("PublicKey Mismatch")]
    PublicKeyMismatch,
    #[msg("Incorrect Owner")]
    IncorrectOwner,
    #[msg("Uninitialized Account")]
    UninitializedAccount,
    #[msg("Numerical Overflow")]
    NumericalOverflow,
    #[msg("Staking is locked")]
    StakingIsLocked
}