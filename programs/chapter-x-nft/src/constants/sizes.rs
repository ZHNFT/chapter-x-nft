use anchor_lang::prelude::*;

pub const PADDING: usize = 100;

pub const BOOK_SIZE: usize = PADDING +
    8 + /* discriminator */
    std::mem::size_of::<Pubkey>() + /* owner */
    std::mem::size_of::<Pubkey>() + /* mint */
    8 + /* current_staking_start */
    8 /* level */
;


pub const CONFIG_SIZE: usize = PADDING + PADDING +
    8 + /* discriminator */
    std::mem::size_of::<Pubkey>() /* owner */
;