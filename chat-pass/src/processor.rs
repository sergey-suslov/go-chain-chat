use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
};

use crate::state::Counter;
use crate::{instruction::CounterInstruction, state::ChatAccount};

pub struct Processor {}

const CHAT_ACCOUNT: u64 = 500;

impl Processor {
    pub fn process_instruction(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = CounterInstruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        match instruction {
            CounterInstruction::Increment => {
                msg!("Instruction: Increment");
                let accounts_iter = &mut accounts.iter();
                let counter_ai = next_account_info(accounts_iter)?;
                let mut counter = Counter::try_from_slice(&counter_ai.data.borrow())?;
                counter.count += 1;
                msg!("Updating count {}", counter.count);
                counter.serialize(&mut *counter_ai.data.borrow_mut())?;
            }
            CounterInstruction::Init => {
                msg!("Instruction: Init");
                let accounts_iter = &mut accounts.iter();
                let payer = next_account_info(accounts_iter)?;
                let account = next_account_info(accounts_iter)?;
                let system_program = next_account_info(accounts_iter)?;

                invoke(
                    &solana_program::system_instruction::create_account(
                        payer.key,
                        account.key,
                        Rent::get()?.minimum_balance(CHAT_ACCOUNT as usize),
                        CHAT_ACCOUNT,
                        program_id,
                    ),
                    &[payer.clone(), account.clone(), system_program.clone()],
                )?;
            }
            CounterInstruction::BuyPass => {
                msg!("Instruction: BuyPass");
                let accounts_iter = &mut accounts.iter();
                let payer = next_account_info(accounts_iter)?;
                let account = next_account_info(accounts_iter)?;
                let system_program = next_account_info(accounts_iter)?;

                invoke(
                    &solana_program::system_instruction::transfer(payer.key, account.key, 1000),
                    &[payer.clone(), account.clone(), system_program.clone()],
                )?;
                let mut account_parsed = ChatAccount::try_from_slice(&account.data.borrow())?;
                account_parsed.users.push(*payer.key);
                account_parsed.serialize(&mut *account.data.borrow_mut())?;
            }
        }
        Ok(())
    }
}
