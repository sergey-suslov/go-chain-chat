use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Counter {
    pub count: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct ChatAccount {
    pub users: Vec<Pubkey>,
}
