use std::ops::Sub;
use spl_token;
use spl_associated_token_account;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, /* Transfer */ };
use anchor_spl::associated_token::AssociatedToken;
use spl_associated_token_account::solana_program;
// use solana_program::sysvar;
use crate::states::book::Book;
use crate::constants::prefixes::BOOK_PREFIX;
use crate::constants::prefixes::BOOK_VAULT_PREFIX;
use crate::constants::prefixes::CONFIG_PREFIX;
use crate::error_codes::errors::Errors;
use crate::states::books_config::BooksConfig;

#[derive(Accounts)]
#[instruction(args: UnstakeArgs)]
pub struct UnstakeContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
    mut,
    seeds=[BOOK_PREFIX.as_bytes(), &mint.key().to_bytes()],
    bump=args.book_nonce
    )]
    pub book: Account<'info, Book>,
    #[account(
    seeds=[CONFIG_PREFIX.as_bytes()],
    bump=args.config_nonce
    )]
    pub config: Account<'info, BooksConfig>,
    #[account(
    mut,
    token::mint = mint,
    token::authority = book_token_account,
    seeds=[BOOK_VAULT_PREFIX.as_bytes(), &mint.key().to_bytes()],
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
    book_token_account_nonce: u8,
    config_nonce: u8
}

pub fn unstake(ctx: Context<UnstakeContext>, args: UnstakeArgs) -> Result<()> {
    let clock = Clock::get().unwrap().unix_timestamp as f64;
    let owner = &ctx.accounts.owner;
    let owner_token_account = &ctx.accounts.owner_token_account;
    let book_token_account = &ctx.accounts.book_token_account;
    let token_program = &ctx.accounts.token_program;
    let book = &mut ctx.accounts.book;
    let mint = &ctx.accounts.mint;
    let config = &ctx.accounts.config;

    let days: f64 = clock.sub(book.current_staking_start as f64);
    if days > config.stake_period_in_secs as f64 {
        msg!("Congratulations, you gained a level");
        book.level += 1;
    } else {
        if config.stake_lock {
            return Err(Errors::StakingIsLocked.into());
        }
        msg!("Not eligible for a new level yet");
    }

    let book_token_account_seeds = [
        BOOK_VAULT_PREFIX.as_bytes(),
        &mint.key().to_bytes(),
        &[args.book_token_account_nonce]
    ];

    solana_program::program::invoke_signed(
        &spl_token::instruction::transfer(
            &token_program.key(),
            &book_token_account.key(),
            &owner_token_account.key(),
            &book_token_account.key(),
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
