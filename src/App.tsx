// @ts-nocheck

import * as React from 'react';
import { BrowserRouter as Router, Route, Routes, Switch, Link, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

import {
    Box,
    Toolbar,
    Tab,
    Typography,
    Alert,
    CheckIcon,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Divider,
    CssBaseline,
    Chip,
    Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import { TabContext, TabList } from '@mui/lab';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DatePicker, { DateObject } from 'react-multi-date-picker';

import './styles/style.css';
import backgroundImage from './assets/baseballs.jpg';

import Home from './pages/Home';
import Games from './pages/Games/Games.tsx';
import Players from './pages/Players/Players.tsx';
import News from './pages/News.tsx';
import Stats from './pages/Stats.tsx';
import Standings from './pages/Standings.tsx';
import Settings from './pages/Settings.tsx';

import BasedashLogo from './assets/basedash_logo.png';

import MobileNav from './components/MobileNav.tsx';
import HeaderWithDrawer from './components/HeaderWithDrawer.tsx';


const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const theme = createTheme({
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
                        // color: '#ffff00',
                    },
                },
            },
        },
    },
});

function NavTabs() {
    const location = useLocation();

    return (
        <TabContext value={location.pathname}>
            <Box>
                <TabList>
                    <Tab label="Home" component={Link} to="/" value="/" />
                    <Tab label="Games" component={Link} to="/games" value="/games" />
                    <Tab label="Players" component={Link} to="/players" value="/players" />
                    <Tab label="News" component={Link} to="/news" value="/news" />
                    <Tab label="Stats" component={Link} to="/stats" value="/stats" />
                    <Tab label="Standings" component={Link} to="/standings" value="/standings" />
                    <Tab label="Settings" component={Link} to="/settings" value="/settings" />
                </TabList>
            </Box>
        </TabContext>
    );
}

export default function App() {
    const [dates, setDates] = React.useState([new DateObject(new Date()), new DateObject(new Date())]);
    const [tableData, setTableData] = React.useState({ dtData: null, gamesDetails: null, selectedIndex: null, page: null });
    const [isLiveGames, setIsLiveGames] = React.useState(false);
    const [isAutoUpdate, setIsAutoUpdate] = React.useState(false);
    const [selectedGame, setSelectedGame] = React.useState(null);
    const [teamsFilter, setTeamsFilter] = React.useState([]);
    const [highlightedPlayer, setHighlightedPlayer] = React.useState(null);
    const [tabValue, setTabValue] = React.useState('Boxscore');
    const [selectedPlayer, setSelectedPlayer] = React.useState({ playerID: null, color: null });
    const [lastTimeZone, setLastTimeZone] = React.useState(localStorage.getItem('timeZone') || '');

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const toggleDrawer = (open: boolean) => {
        setDrawerOpen(open);
    };

    // const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    // console.log(isTouchDevice);

    const isMobileDevice = () => {
        return (
            /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
        );
    };

    // console.log(isMobileDevice());
    // console.log(navigator.userAgent);

    return (
        <>
            <Analytics />
            <Router>
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <CssBaseline />
                        {isMobileDevice() ? (
                            <>
                                <HeaderWithDrawer />
                                <Box sx={{ p: 2 }}>
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/games" element={<Games
                                            dates={dates}
                                            setDates={setDates}
                                            tableData={tableData}
                                            setTableData={setTableData}
                                            isLiveGames={isLiveGames}
                                            setIsLiveGames={setIsLiveGames}
                                            isAutoUpdate={isAutoUpdate}
                                            setIsAutoUpdate={setIsAutoUpdate}
                                            selectedGame={selectedGame}
                                            setSelectedGame={setSelectedGame}
                                            teamsFilter={teamsFilter}
                                            setTeamsFilter={setTeamsFilter}
                                            highlightedPlayer={highlightedPlayer}
                                            setHighlightedPlayer={setHighlightedPlayer}
                                            tabValue={tabValue}
                                            setTabValue={setTabValue}
                                            setSelectedPlayer={setSelectedPlayer}
                                            lastTimeZone={lastTimeZone}
                                            setLastTimeZone={setLastTimeZone}
                                        />} />
                                        <Route path="/players" element={<Players
                                            selectedPlayer={selectedPlayer}
                                            setSelectedPlayer={setSelectedPlayer}
                                            setSelectedGame={setSelectedGame}
                                        />} />
                                        <Route path="/news" element={<News />} />
                                        <Route path="/stats" element={<p>stats<br />(no content yet)</p>} />
                                        <Route path="/standings" element={<Standings />} />
                                        <Route path="/settings" element={<Settings />} />
                                    </Routes>
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        backgroundImage: `url(${backgroundImage})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        height: '64px',
                                        mb: 0,
                                        p: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                    }}
                                />
                                <Toolbar>
                                    <Typography variant="h4" noWrap component="div">
                                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                                            Basedash
                                        </Link>
                                    </Typography>
                                    <Box
                                        sx={{
                                            backgroundImage: `url(${BasedashLogo})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            width: '100px',
                                            height: '100px',
                                            ml: 2,
                                            mr: 4,
                                            p: 4,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                        }}
                                    />
                                    <Chip
                                        component="a"
                                        href="https://reddit.com/r/mlb"
                                        target="_blank"
                                        clickable
                                        avatar={
                                            <Avatar
                                                src="https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png"
                                                alt="Reddit"
                                            />
                                        }
                                        label="r/mlb"
                                        variant="outlined"
                                        sx={{
                                            textDecoration: 'none',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                        }}
                                    />
                                </Toolbar>
                                <Box sx={{ ml: 0 }}>
                                    <NavTabs />
                                    <Box sx={{ p: 4 }}>
                                        <Routes>
                                            <Route path="/" element={<Home />} />
                                            <Route path="/games" element={<Games
                                                dates={dates}
                                                setDates={setDates}
                                                tableData={tableData}
                                                setTableData={setTableData}
                                                isLiveGames={isLiveGames}
                                                setIsLiveGames={setIsLiveGames}
                                                isAutoUpdate={isAutoUpdate}
                                                setIsAutoUpdate={setIsAutoUpdate}
                                                selectedGame={selectedGame}
                                                setSelectedGame={setSelectedGame}
                                                teamsFilter={teamsFilter}
                                                setTeamsFilter={setTeamsFilter}
                                                highlightedPlayer={highlightedPlayer}
                                                setHighlightedPlayer={setHighlightedPlayer}
                                                tabValue={tabValue}
                                                setTabValue={setTabValue}
                                                setSelectedPlayer={setSelectedPlayer}
                                                lastTimeZone={lastTimeZone}
                                                setLastTimeZone={setLastTimeZone}
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
                                        </Routes>
                                    </Box>
                                </Box>
                            </>
                        )}
                    </LocalizationProvider>
                </ThemeProvider>
            </Router>
        </>
    )
}
