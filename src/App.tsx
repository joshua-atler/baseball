import * as React from 'react'
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom'
import './App.css'
// import './styles/style.css'

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Typography from '@mui/material/Typography';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CssBaseline from '@mui/material/CssBaseline';

import MainContent from './pages/Home';
import Games from './pages/Games/Games.tsx';
import backgroundImage from './assets/baseballs.jpg';

import DatePicker, { DateObject } from 'react-multi-date-picker';



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
          <Tab label="Stats" component={Link} to="/stats" value="/stats" />
          <Tab label="Rosters" component={Link} to="/rosters" value="/rosters" />
          <Tab label="Standings" component={Link} to="/standings" value="/standings" />
          <Tab label="Settings" component={Link} to="/settings" value="/settings" />
        </TabList>
      </Box>
    </TabContext>
  );
}

export default function App() {
  const [dates, setDates] = React.useState([new DateObject(new Date()), new DateObject(new Date())]);
  const [tableData, setTableData] = React.useState({ dtData: null, gamesDetails: null, selectedIndex: null });
  const [isLiveGames, setIsLiveGames] = React.useState(false);
  const [isAutoUpdate, setIsAutoUpdate] = React.useState(false);
  const [selectedGame, setSelectedGame] = React.useState(null);
  const [teamsFilter, setTeamsFilter] = React.useState([]);
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [tabValue, setTabValue] = React.useState(0);


  return (
    <>
      <Router>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <CssBaseline />
            {/* <Drawer /> */}
            {/* <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}></Box> */}
            <Box
              sx={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '64px',
                // mt: 2,
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
            </Toolbar>
            <Box sx={{ ml: 0 }}>
              <NavTabs />
              <Box sx={{ p: 4 }}>
                <Routes>
                  <Route path="/" element={<MainContent />} />
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
                    selectedPlayer={selectedPlayer}
                    setSelectedPlayer={setSelectedPlayer}
                    tabValue={tabValue}
                    setTabValue={setTabValue}
                  />} />
                  <Route path="/stats" element={<div>stats</div>} />
                  <Route path="/rosters" element={<div>rosters</div>} />
                  <Route path="/standings" element={<div>standings</div>} />
                  <Route path="/settings" element={<div>settings</div>} />
                </Routes>
              </Box>
            </Box>
          </LocalizationProvider>
        </ThemeProvider>
      </Router>
    </>
  )
}
