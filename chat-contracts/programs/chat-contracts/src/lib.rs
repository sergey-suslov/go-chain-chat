use anchor_lang::prelude::*;
use num_derive::*;
use num_traits::*;
use program::ChatContracts;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod chat_contracts {
    use super::*;
    use anchor_lang::solana_program::{program, system_instruction};

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let chat_account = &mut ctx.accounts.chat_account;
        chat_account.users = Vec::new();
        Ok(())
    }

    pub fn check_pass(ctx: Context<CheckPass>, address: Pubkey) -> Result<bool> {
        Ok(ctx
            .accounts
            .chat_account
            .users
            .iter()
            .any(|e| address == e.address))
    }

    pub fn buy_pass(ctx: Context<BuyPass>, amount: u64) -> Result<()> {
        let transaction =
            system_instruction::transfer(&ctx.accounts.user.key(), ctx.program_id, amount);
        let _ = program::invoke(
            &transaction,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.chat_program.to_account_info(),
            ],
        );
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Eq, PartialEq, Clone, Copy, Debug)]
pub struct UserAccess {
    address: Pubkey,
    access_until: i64,
}

#[account]
pub struct ChatAccount {
    users: Vec<UserAccess>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // TODO adjust space
    #[account(init, payer = user, space = 9000)]
    pub chat_account: Account<'info, ChatAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CheckPass<'info> {
    #[account()]
    pub chat_account: Account<'info, ChatAccount>,
}

#[derive(Accounts)]
pub struct BuyPass<'info> {
    #[account(mut)]
    pub chat_account: Account<'info, ChatAccount>,
    pub chat_program: Program<'info, ChatContracts>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
