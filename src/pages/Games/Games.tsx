// @ts-nocheck

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import Grid from '@mui/material/Grid2';
import GamesList from './GamesList';
import Boxscore from './Boxscore';
import Plays from './Plays';
import News from './News';
import Media from './Media';
import WinProb from './WinProb';
import { useBasedash } from '../../context/BasedashContext';


const useScreenWidth = () => {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return screenWidth;
};

export const Games = () => {
    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const {
        selectedGame,
        setSelectedGame,
        selectedPlayer,
        setSelectedPlayer
    } = useBasedash();

    const [tabValue, setTabValue] = useState('Boxscore');
    const [highlightedPlayer, setHighlightedPlayer] = useState(null);

    const getTabValue = (value) => {
        return ["Plays", "News", "Media", "Win Probability"].includes(value) ? value : "Plays";
    }

    return (
        <>
            <Grid container spacing={2} id="games-grid">
                <Grid>
                    <GamesList
                        selectedGame={setSelectedGame}
                        setSelectedGame={setSelectedGame}
                    />
                </Grid>
                {/* {screenWidth > 2550 ? */}
                    {/* <> */}
                        <Grid>
                            <Boxscore
                                selectedGame={selectedGame}
                                highlightedPlayer={highlightedPlayer}
                                setSelectedPlayer={setSelectedPlayer}
                            />
                        </Grid>
                        <Grid>
                            <Tabs value={getTabValue(tabValue)} onChange={handleChange} sx={{ mb: 4.5 }}>
                                <Tab label="Plays" value={"Plays"} />
                                <Tab label="News" value={"News"} />
                                <Tab label="Media" value={"Media"} />
                                <Tab label="Win Probability" value={"Win Probability"} />
                            </Tabs>
                            <Box sx={{ width: '100%' }}>
                                {getTabValue(tabValue) === "Plays" && <Plays selectedGame={selectedGame} setHighlightedPlayer={setHighlightedPlayer} />}
                                {getTabValue(tabValue) === "News" && <News gamePk={selectedGame?.['gamePk'] || null} />}
                                {getTabValue(tabValue) === "Media" && <Media gamePk={selectedGame?.['gamePk'] || null} />}
                                {getTabValue(tabValue) === "Win Probability" && <WinProb gamePk={selectedGame?.['gamePk'] || null} />}
                            </Box>
                        </Grid>
                    {/* </> : <> */}
                        {/* <Grid>
                            <Tabs value={tabValue} onChange={handleChange} sx={{ mb: 4.5 }}>
                                <Tab label="Boxscore" value={"Boxscore"} />
                                <Tab label="Plays" value={"Plays"} />
                                <Tab label="News" value={"News"} />
                                <Tab label="Media" value={"Media"} />
                                <Tab label="Win Probability" value={"Win Probability"} />
                            </Tabs>
                            <Box sx={{ width: '100%' }}>
                                {tabValue === "Boxscore" && <Boxscore
                                    selectedGame={selectedGame}
                                    highlightedPlayer={highlightedPlayer}
                                    setSelectedPlayer={setSelectedPlayer}
                                    lastTimeZone={lastTimeZone}
                                />}
                                {tabValue === "Plays" && <Plays selectedGame={selectedGame} setHighlightedPlayer={setHighlightedPlayer} />}
                                {tabValue === "News" && <News gamePk={selectedGame?.['gamePk'] || null} />}
                                {tabValue === "Media" && <Media gamePk={selectedGame?.['gamePk'] || null} />}
                                {tabValue === "Win Probability" && <WinProb gamePk={selectedGame?.['gamePk'] || null} />}
                            </Box>
                        </Grid> */}
                    {/* </>} */}
            </Grid>
        </>
    )
}
