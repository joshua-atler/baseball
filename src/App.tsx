// @ts-nocheck

import * as React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { BasedashProvider } from './context/BasedashContext.tsx';
import { baseDashTheme } from './theme.ts';
import { NavTabs } from './NavTabs.tsx';
import { Header } from './Header.tsx';
import Games from './pages/Games/Games.tsx';
import Players from './pages/Players/Players.tsx';
import News from './pages/News.tsx';
import Stats from './pages/Stats.tsx';
import Standings from './pages/Standings.tsx';
import Settings from './pages/Settings.tsx';

import './styles/style.css';

export default function App() {
    const [selectedGame, setSelectedGame] = React.useState(null);
    const [selectedPlayer, setSelectedPlayer] = React.useState({ playerID: null, color: null });

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
                            <Box sx={{ p: 4 }}>
                                <Routes>
                                    <Route path="/games" element={<Games
                                        selectedGame={selectedGame}
                                        setSelectedGame={setSelectedGame}
                                        setSelectedPlayer={setSelectedPlayer}
                                    />} />
                                    <Route path="/players" element={<Players
                                        selectedPlayer={selectedPlayer}
                                        setSelectedPlayer={setSelectedPlayer}
                                        setSelectedGame={setSelectedGame}
                                    />} />
                                    <Route path="/news" element={<News />} />
                                    <Route path="/stats" element={<Stats />} />
                                    <Route path="/standings" element={<Standings />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path="*" element={<Navigate to="/games" replace />} />
                                </Routes>
                            </Box>
                        </BasedashProvider>
                    </LocalizationProvider>
                </ThemeProvider>
            </Router>
        </>
    )
}
