import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Analytics } from '@vercel/analytics/react';
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from 'react-router-dom';

import { BasedashProvider } from './context/BasedashContext.tsx';
import { Header } from './Header.tsx';
import { NavTabs } from './NavTabs.tsx';
import { Games } from './pages/Games/Games.tsx';
import { News } from './pages/News.tsx';
import { Players } from './pages/Players/Players.tsx';
import { Settings } from './pages/Settings.tsx';
import { Standings } from './pages/Standings.tsx';
import { Stats } from './pages/Stats.tsx';
import { baseDashTheme } from './theme.ts';

export const App = () => {
    return (
        <>
            <Analytics />
            <Router>
                <ThemeProvider theme={baseDashTheme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <CssBaseline />
                        <BasedashProvider>
                            <Header />
                            <NavTabs />
                            <Box
                                sx={{
                                    p: 4,
                                    '& table th, & table td': {
                                        padding: '8px',
                                    },
                                    '& table:not(.dataTable)': {
                                        width: '600px',
                                        marginBottom: '20px',
                                        border: '1px solid white',
                                        borderCollapse: 'collapse',
                                    },
                                    '& div.dt-paging button.dt-paging-button': {
                                        backgroundImage: 'none !important',
                                        backgroundColor: '#555555 !important',

                                        '&:hover': {
                                            backgroundColor:
                                                '#888888 !important',
                                        },
                                        '&:active': {
                                            backgroundColor:
                                                '#333333 !important',
                                        },
                                        '&.disabled': {
                                            backgroundColor:
                                                '#555555 !important',
                                        },
                                    },
                                    '& span.tooltip': {
                                        borderBottom: '2px dotted white',
                                        position: 'relative',
                                        userSelect: 'none',

                                        '&::after': {
                                            content: 'attr(data-tooltip)',
                                            position: 'absolute',
                                            backgroundColor: 'black',
                                            color: 'white',
                                            padding: '5px',
                                            borderRadius: '5px',
                                            bottom: '200%',
                                            left: '50%',
                                            width: '125px',
                                            textAlign: 'center',
                                            transform: 'translateX(-50%)',
                                            opacity: 0,
                                            transition: 'opacity 0.3s',
                                            visibility: 'hidden',
                                        },

                                        '&:hover::after': {
                                            opacity: 1,
                                            visibility: 'visible',
                                        },
                                    },
                                    '& tr.dtrg-group.dtrg-start': {
                                        backgroundColor: '#1a1a1a !important',
                                        color: '#fff !important',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        fontSize: '0.85rem',
                                    },
                                }}
                            >
                                <Routes>
                                    <Route path="/games" element={<Games />} />
                                    <Route
                                        path="/players"
                                        element={<Players />}
                                    />
                                    <Route path="/news" element={<News />} />
                                    <Route path="/stats" element={<Stats />} />
                                    <Route
                                        path="/standings"
                                        element={<Standings />}
                                    />
                                    <Route
                                        path="/settings"
                                        element={<Settings />}
                                    />
                                    <Route
                                        path="*"
                                        element={
                                            <Navigate to="/games" replace />
                                        }
                                    />
                                </Routes>
                            </Box>
                        </BasedashProvider>
                    </LocalizationProvider>
                </ThemeProvider>
            </Router>
        </>
    );
};
