import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      dark: string;
      accent: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      dark?: string;
      accent?: string;
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
    },
    palette: {
        mode: 'dark',
        custom: {
            dark: '#2c323a',
        },
    },
});
