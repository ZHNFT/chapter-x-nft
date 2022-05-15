use anchor_lang::prelude::*;

#[account]
pub struct Book {
    pub(crate) owner: Pubkey,
    pub(crate) mint: Pubkey,
    pub(crate) current_staking_start: u64,
    pub(crate) level: u64
}
