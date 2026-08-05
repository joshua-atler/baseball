import { Box } from '@mui/material';

export const LoadingCircle = ({ size }: { size: number }) => {
    return (
        <Box
            sx={{
                width: size,
                height: size,
                borderRadius: '50%',
                border: '5px solid rgba(255, 255, 255, 0.1)',
                borderTop: (theme) =>
                    `5px solid ${theme.palette.custom.highlightGreen}`,
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
            }}
        />
    );
};
