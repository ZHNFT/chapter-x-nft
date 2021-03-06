use anchor_lang::prelude::*;
use crate::constants::prefixes::CONFIG_PREFIX;
use crate::constants::sizes::CONFIG_SIZE;
use crate::states::books_config::BooksConfig;

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
    stake_period_in_secs: u64,
    stake_lock: bool
}

pub fn create_config(ctx: Context<CreateConfigContext>, args: CreateConfigArgs) -> Result<()> {
    let owner = &ctx.accounts.owner;
    let config = &mut ctx.accounts.config;

    config.owner = owner.key();
    config.stake_period_in_secs = args.stake_period_in_secs;
    config.stake_lock = args.stake_lock;

    Ok(())
}
