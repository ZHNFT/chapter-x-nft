use std::io::Write;
use spl_token;
use spl_associated_token_account;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use spl_associated_token_account::solana_program;
use solana_program::sysvar;
use crate::states::book::Book;
use crate::constants::sizes::BOOK_SIZE;
use crate::constants::prefixes::BOOK_PREFIX;
use crate::constants::prefixes::BOOK_VAULT_PREFIX;
use crate::utils::assert::assert_is_ata;

#[derive(Accounts)]
#[instruction(args: StakeArgs)]
pub struct StakeContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
    init_if_needed,
    seeds=[BOOK_PREFIX.as_bytes(), &mint.key().to_bytes(), &owner.key().to_bytes()],
    payer=owner,
    space=BOOK_SIZE,
    bump
    )]
    pub book: Account<'info, Book>,
    #[account(
    init_if_needed,
    token::mint = mint,
    token::authority = book_token_account,
    seeds=[BOOK_VAULT_PREFIX.as_bytes(), &mint.key().to_bytes() , &owner.key().to_bytes()],
    payer=owner,
    bump
    )]
    pub book_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    #[account(
    mut,
    associated_token::mint=mint,
    associated_token::authority=owner,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct StakeArgs {
    book_nonce: u8,
    book_token_account_nonce: u8
}

pub fn stake(ctx: Context<StakeContext>, args: StakeArgs) -> Result<()> {
    let clock = Clock::get().unwrap().unix_timestamp;
    let owner = &ctx.accounts.owner;
    let owner_token_account = &ctx.accounts.owner_token_account;
    let book_token_account = &ctx.accounts.book_token_account;
    let token_program = &ctx.accounts.token_program;
    let book = &mut ctx.accounts.book;
    let mint = &ctx.accounts.mint;
    if book.to_account_info().data_is_empty() {
        book.level = 0;
    }

    book.owner = owner.key();
    book.mint = mint.key();
    book.current_staking_start = clock as u64;

    solana_program::program::invoke(
        &spl_token::instruction::transfer(
            &token_program.key(),
            &owner_token_account.key(),
            &book_token_account.key(),
            &owner.key(),
            &[],
            1,
        )?,
        &[
            book_token_account.to_account_info(),
            owner_token_account.to_account_info(),
            token_program.to_account_info(),
            owner.to_account_info(),
        ],
    )?;

    Ok(())
}
