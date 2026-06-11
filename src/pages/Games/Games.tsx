// @ts-nocheck

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import Grid from '@mui/material/Grid2';
import GamesList from './GamesList';
import Boxscore from './Boxscore';
import Plays from './Plays';
import GameArticle from './GameArticle';
import Media from './Media';
import GameStats from './GameStats';
import WinProb from './WinProb';
import { useBasedash } from '../../context/BasedashContext';
import { GameTabContent } from '../../components/GameTabContent';


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

    const {
        selectedGame,
        selectedPlayer,
        setSelectedPlayer
    } = useBasedash();

    const [tabValue, setTabValue] = useState('Boxscore');

    const getTabValue = (value) => {
        return ["Plays", "News", "Media", "Stats", "Win Probability"].includes(value) ? value : "Plays";
    }

    return (
        <>
            <Grid container spacing={2} id="games-grid" sx={{ fontSize: 14}}>
                <Grid>
                    <GamesList/>
                </Grid>
                {/* {screenWidth > 2550 ? */}
                {/* <> */}
                <Grid>
                    <Boxscore
                        highlightedPlayer={undefined}
                        // highlightedPlayer={highlightedPlayer}
                        setSelectedPlayer={setSelectedPlayer}
                    />
                </Grid>
                <Grid>
                    <Tabs value={getTabValue(tabValue)} onChange={(e, newValue) => {
                        setTabValue(newValue);
                    }} sx={{ mb: 4.5 }}>
                        <Tab label="Plays" value={"Plays"} />
                        <Tab label="News" value={"News"} />
                        <Tab label="Media" value={"Media"} />
                        <Tab label="Stats" value={"Stats"} />
                        <Tab label="Win Probability" value={"Win Probability"} />
                    </Tabs>
                    <Box sx={{ width: '100%' }}>
                        {selectedGame ? <>
                            {getTabValue(tabValue) === "Plays" && <Plays key={selectedGame} />}
                            {getTabValue(tabValue) === "News" && <GameArticle key={selectedGame} />}
                            {getTabValue(tabValue) === "Media" && <Media key={selectedGame} />}
                            {getTabValue(tabValue) === "Stats" && <GameStats key={selectedGame} />}
                            {getTabValue(tabValue) === "Win Probability" && <WinProb key={selectedGame} />}
                        </> : <>
                            <GameTabContent>
                                <Typography variant="h5">Select a game</Typography>
                            </GameTabContent>
                        </>}
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
