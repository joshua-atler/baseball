import { Box, styled } from '@mui/material';

export const GameTabContent = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.custom.dark,
    borderRadius: '20px',
    padding: '2rem',
    margin: '0 auto',
    width: '600px',
    maxHeight: '1500px',
    overflowY: 'auto'
}));
