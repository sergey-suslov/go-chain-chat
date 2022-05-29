use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Counter {
    pub count: u64,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct ChatAccount {
    #[allow(dead_code)]
    pub is_initialized: bool,
    #[allow(dead_code)]
    pub users: Vec<Pubkey>,
}

impl IsInitialized for ChatAccount {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Sealed for ChatAccount {}

impl Pack for ChatAccount {
    const LEN: usize = 500;

    fn pack_into_slice(&self, dst: &mut [u8]) {
        todo!()
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, solana_program::program_error::ProgramError> {
        todo!()
    }

    fn get_packed_len() -> usize {
        Self::LEN
    }

    fn unpack(input: &[u8]) -> Result<Self, solana_program::program_error::ProgramError>
    where
        Self: solana_program::program_pack::IsInitialized,
    {
        let value = Self::unpack_unchecked(input)?;
        if value.is_initialized() {
            Ok(value)
        } else {
            Err(solana_program::program_error::ProgramError::UninitializedAccount)
        }
    }

    fn unpack_unchecked(input: &[u8]) -> Result<Self, solana_program::program_error::ProgramError> {
        if input.len() != Self::LEN {
            return Err(solana_program::program_error::ProgramError::InvalidAccountData);
        }
        Self::unpack_from_slice(input)
    }

    fn pack(src: Self, dst: &mut [u8]) -> Result<(), solana_program::program_error::ProgramError> {
        if dst.len() != Self::LEN {
            return Err(solana_program::program_error::ProgramError::InvalidAccountData);
        }
        src.pack_into_slice(dst);
        Ok(())
    }
}
