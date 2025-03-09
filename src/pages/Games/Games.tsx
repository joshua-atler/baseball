// @ts-nocheck

import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import Grid from '@mui/material/Grid2';
import GamesList from './GamesList';
import Boxscore from './Boxscore';
import Plays from './Plays';
import News from './News';
import Media from './Media';


export default function Games({
    dates,
    setDates,
    tableData,
    setTableData,
    isLiveGames,
    setIsLiveGames,
    isAutoUpdate,
    setIsAutoUpdate,
    selectedGame,
    setSelectedGame,
    teamsFilter,
    setTeamsFilter,
    highlightedPlayer,
    setHighlightedPlayer,
    tabValue,
    setTabValue,
    setSelectedPlayer,
    lastTimeZone,
    setLastTimeZone
}) {
    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <>
            <Grid container spacing={2} id="games-grid">
                <Grid>
                    <GamesList
                        dates={dates}
                        setDates={setDates}
                        tableData={tableData}
                        setTableData={setTableData}
                        isLiveGames={isLiveGames}
                        setIsLiveGames={setIsLiveGames}
                        isAutoUpdate={isAutoUpdate}
                        setIsAutoUpdate={setIsAutoUpdate}
                        selectedGame={setSelectedGame}
                        setSelectedGame={setSelectedGame}
                        teamsFilter={teamsFilter}
                        setTeamsFilter={setTeamsFilter}
                        lastTimeZone={lastTimeZone}
                        setLastTimeZone={setLastTimeZone}
                    />
                </Grid>
                {/* <Divider orientation="vertical" flexItem sx={{ height: "100%", margin: "0 16px" }} /> */}
                <Grid>
                    <Boxscore
                        selectedGame={selectedGame}
                        highlightedPlayer={highlightedPlayer}
                        setSelectedPlayer={setSelectedPlayer}
                        lastTimeZone={lastTimeZone}
                    />
                </Grid>
                <Grid>
                    <Tabs value={tabValue} onChange={handleChange} sx={{ mb: 4.5 }}>
                        <Tab label="Plays" value={0} />
                        <Tab label="News" value={1} />
                        <Tab label="Media" value={2} />
                    </Tabs>
                    <Box sx={{ width: '100%' }}>
                        {tabValue === 0 && <Plays selectedGame={selectedGame} setHighlightedPlayer={setHighlightedPlayer} />}
                        {tabValue === 1 && <News gamePk={selectedGame?.['gamePk'] || null} />}
                        {tabValue === 2 && <Media gamePk={selectedGame?.['gamePk'] || null} />}
                    </Box>

                </Grid>
            </Grid>
        </>
    )
}
