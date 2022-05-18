use anchor_lang::prelude::*;
use crate::constants::prefixes::CONFIG_PREFIX;
use crate::states::books_config::BooksConfig;

#[derive(Accounts)]
#[instruction(args: EditConfigArgs)]
pub struct EditConfigContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
    mut,
    has_one=owner,
    seeds=[CONFIG_PREFIX.as_bytes()],
    bump=args.book_config_none
    )]
    pub config: Account<'info, BooksConfig>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct EditConfigArgs {
    stake_period_in_secs: u64,
    stake_lock: bool,
    book_config_none: u8
}

pub fn edit_config(ctx: Context<EditConfigContext>, args: EditConfigArgs) -> Result<()> {
    let config = &mut ctx.accounts.config;

    config.stake_period_in_secs = args.stake_period_in_secs;
    config.stake_lock = args.stake_lock;

    Ok(())
}
