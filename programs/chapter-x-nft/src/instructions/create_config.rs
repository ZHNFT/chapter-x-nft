use std::io::Write;
use spl_token;
use spl_associated_token_account;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use anchor_spl::associated_token::AssociatedToken;
use spl_associated_token_account::solana_program;
use solana_program::sysvar;
use crate::constants::sizes::CONFIG_SIZE;
use crate::constants::prefixes::CONFIG_PREFIX;
use crate::states::books_config::BooksConfig;
use crate::utils::assert::assert_is_ata;

#[derive(Accounts)]
#[instruction(args: CreateConfigArgs)]
pub struct CreateConfigContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
    init_if_needed,
    seeds=[CONFIG_PREFIX.as_bytes()],
    payer=owner,
    space=CONFIG_SIZE,
    bump
    )]
    pub config: Account<'info, BooksConfig>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateConfigArgs {
    stake_period_in_secs: u64
}

pub fn create_config(ctx: Context<CreateConfigContext>, args: CreateConfigArgs) -> Result<()> {
    let owner = &ctx.accounts.owner;
    let config = &mut ctx.accounts.config;

    config.owner = owner.key();
    config.stake_period_in_secs = args.stake_period_in_secs;

    Ok(())
}
