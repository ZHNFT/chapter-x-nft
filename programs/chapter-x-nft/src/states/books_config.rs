use anchor_lang::prelude::*;

#[account]
pub struct BooksConfig {
    pub(crate) owner: Pubkey,
    pub(crate) stake_period_in_secs: u64,
    pub(crate) stake_lock: bool
}
