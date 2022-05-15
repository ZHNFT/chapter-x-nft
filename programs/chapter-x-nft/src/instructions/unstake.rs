use std::io::Write;
use spl_token;
use spl_associated_token_account;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use spl_associated_token_account::solana_program;
use solana_program::sysvar;
use crate::constants::period::STAKE_PERIOD_IN_DAYS;
use crate::states::book::Book;
use crate::constants::sizes::BOOK_SIZE;
use crate::constants::prefixes::BOOK_PREFIX;
use crate::constants::prefixes::BOOK_VAULT_PREFIX;
use crate::error_codes::errors::Errors;
use crate::utils::assert::assert_is_ata;

#[derive(Accounts)]
#[instruction(args: UnstakeArgs)]
pub struct UnstakeContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
    mut,
    seeds=[BOOK_PREFIX.as_bytes(), &mint.key().to_bytes(), &owner.key().to_bytes()],
    bump=args.book_nonce
    )]
    pub book: Account<'info, Book>,
    #[account(
    mut,
    token::mint = mint,
    token::authority = book_token_account,
    seeds=[BOOK_VAULT_PREFIX.as_bytes(), &mint.key().to_bytes() , &owner.key().to_bytes()],
    bump=args.book_token_account_nonce
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
pub struct UnstakeArgs {
    book_nonce: u8,
    book_token_account_nonce: u8
}

pub fn unstake(ctx: Context<UnstakeContext>, args: UnstakeArgs) -> Result<()> {
    let clock = Clock::get().unwrap().unix_timestamp;
    let owner = &ctx.accounts.owner;
    let owner_token_account = &ctx.accounts.owner_token_account;
    let book_token_account = &ctx.accounts.book_token_account;
    let token_program = &ctx.accounts.token_program;
    let book = &mut ctx.accounts.book;
    let mint = &ctx.accounts.mint;

    let days = clock.checked_sub(book.current_staking_start as i64).ok_or(Errors::NumericalOverflow)?;
    if days > STAKE_PERIOD_IN_DAYS as i64 {
        book.level += 1;
        // upgrade NFT
        // https://github.com/metaplex-foundation/metaplex-program-library/blob/ed7c5c0202088fd60e43a532a2a73cb98eea5c58/token-metadata/program/src/instruction.rs#L524
    }

    let book_token_account_seeds = [
        BOOK_VAULT_PREFIX.as_bytes(),
        &mint.key().to_bytes(),
        &owner.key().to_bytes(),
        &[args.book_token_account_nonce]
    ];

    solana_program::program::invoke_signed(
        &spl_token::instruction::transfer(
            &token_program.key(),
            &book_token_account.key(),
            &owner_token_account.key(),
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
        &[&book_token_account_seeds]
    )?;

    Ok(())
}
