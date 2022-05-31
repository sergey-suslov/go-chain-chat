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
        msg!("Amount {}", amount);
        let transaction = system_instruction::transfer(
            &ctx.accounts.user.key(),
            &ctx.accounts.chat_account.key(),
            1000,
        );
        program::invoke(
            &transaction,
            &[
                ctx.accounts.user.to_account_info(),
                ctx.accounts.chat_account.to_account_info(),
            ],
        )?;

        ctx.accounts.chat_account.users.push(UserAccess {
            address: ctx.accounts.user.key(),
            access_until: Clock::get()?.unix_timestamp,
        });

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
    #[account(init, payer = user, space = 500)]
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
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
