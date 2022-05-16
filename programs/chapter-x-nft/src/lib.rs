mod instructions;
mod constants;
mod error_codes;
mod utils;
mod states;

use instructions::*;
use anchor_lang::prelude::*;

declare_id!("3JYJq2FJqK2sR1ySqYVchE3dyYwdaspPEmWu83rVkhUi");

#[program]
pub mod chapter_x_nft {
    use super::*;

    pub fn stake(ctx: Context<StakeContext>, args: StakeArgs) -> Result<()> {
        stake::stake(ctx, args)
    }

    pub fn unstake(ctx: Context<UnstakeContext>, args: UnstakeArgs) -> Result<()> {
        unstake::unstake(ctx, args)
    }
}
