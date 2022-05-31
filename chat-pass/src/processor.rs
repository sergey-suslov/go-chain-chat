use std::ops::Deref;

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    borsh::try_from_slice_unchecked,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
};

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
                // let mut counter = Counter::try_from_slice(&counter_ai.data.borrow_mut())?;
                // counter.count += 1;
                // msg!("Updating count {}", counter.count);
                // counter.serialize(&mut *counter_ai.data.borrow_mut())?;
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
                let init_account = ChatAccount {
                    is_initialized: true,
                    users: vec![(*payer.key)],
                };
                msg!("Account from{:?}", init_account);
                let mut temp: Vec<u8> = Vec::new();
                init_account.serialize(&mut temp)?;
                let mut data = account.try_borrow_mut_data()?;
                init_account.serialize(&mut *data)?;
                msg!("Account initiated {:?}", data);
                msg!("Account parsed {:?}", account.data);
            }
            CounterInstruction::BuyPass => {
                msg!("Instruction: BuyPass");
                let accounts_iter = &mut accounts.iter();
                let payer = next_account_info(accounts_iter)?;
                let account = next_account_info(accounts_iter)?;
                let system_program = next_account_info(accounts_iter)?;

                msg!("Invoking transfer");
                invoke(
                    &solana_program::system_instruction::transfer(payer.key, account.key, 1000),
                    &[payer.clone(), account.clone(), system_program.clone()],
                )?;
                msg!("Transfer succeeded");

                let mut account_parsed = {
                    let data = &*account.data.try_borrow().unwrap();
                    let data_as_ref_mut = data;
                    msg!("Parsing account {:?}", account.data);
                    try_from_slice_unchecked::<ChatAccount>(data_as_ref_mut)?
                };
                // let mut account_parsed =
                //     ChatAccount::try_from_slice(&account.try_borrow_mut_data()?)?;

                msg!("Parsed account {:?}", account_parsed.clone());
                account_parsed.users.push(*payer.key);
                let data_mut = &mut *account.data.try_borrow_mut().unwrap();
                account_parsed.serialize(data_mut)?;
                msg!("Written account {:?}", account.data);
            }
        }
        Ok(())
    }
}
