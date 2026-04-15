import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Palette {
        custom: {
            dark: string;
            white: string;
            lightGray: string;
            darkGray: string;
            highlightBlue: string;
            highlightGreen: string;
            plays: string;
            playsHover: string;
            innings: string;
            inningsHover: string;
        };
    }
    interface PaletteOptions {
        custom?: {
            dark?: string;
            white?: string;
            lightGray?: string;
            darkGray?: string;
            highlightBlue?: string;
            highlightGreen?: string;
            plays: string;
            playsHover: string;
            innings: string;
            inningsHover: string;
        };
    }
}


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export const baseDashTheme = createTheme({
    ...darkTheme,
    components: {
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    color: 'inherit',
                    '&:hover': {
                        color: '#90caf9',
                    },
                    '&:active': {
                        color: '#64b5f6',
                    },
                    '&:focus': {
                        color: '#64b5f6',
                    },
                },
            },
        },
        MuiFormControlLabel: {
            styleOverrides: {
                label: {
                    userSelect: 'none',
                },
            },
        },
    },
    palette: {
        mode: 'dark',
        custom: {
            dark: '#2c323a',
            white: '#ffffff',
            lightGray: '#666666',
            darkGray: '#444444',
            highlightBlue: '#374bfb',
            highlightGreen: '#41ff4181',
            innings: '#222222',
            inningsHover: '#333333',
            plays: '#555555',
            playsHover: '#666666',
        },
    },
});
