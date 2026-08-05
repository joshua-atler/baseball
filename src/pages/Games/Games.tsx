import { Box, Tab, Tabs, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';

import { GameTabContent } from '../../components/GameTabContent';
import { useBasedash } from '../../context/BasedashContext';
import { Boxscore } from './Boxscore';
import { GameArticle } from './GameArticle';
import { GameMedia } from './GameMedia';
import { GamesList } from './GamesList';
import { GameStats } from './GameStats';
import { Plays } from './Plays';
import { WinProb } from './WinProb';

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
    const { selectedGame, selectedPlayer, setSelectedPlayer } = useBasedash();

    const [tabValue, setTabValue] = useState('Boxscore');

    const getTabValue = (value) => {
        return ['Plays', 'News', 'Media', 'Stats', 'Win Probability'].includes(
            value
        )
            ? value
            : 'Plays';
    };

    return (
        <>
            <Grid container spacing={2} sx={{ fontSize: 14 }}>
                <Grid>
                    <GamesList />
                </Grid>
                <Grid>
                    <Box
                        sx={{
                            '& table#linescore': {
                                '& th, & td': {
                                    width: '20px',
                                    textAlign: 'center',
                                },
                                '& th:first-of-type, & td:first-of-type': {
                                    width: '25%',
                                    textAlign: 'left',
                                },
                            },
                            '& table#boxscore': {
                                tableLayout: 'fixed',
                                '& th': { boxSizing: 'border-box' },
                                '& td': {
                                    boxSizing: 'border-box',
                                    padding: '3px',
                                },
                                '& tbody td, & tfoot td': {
                                    textAlign: 'center',
                                },
                                '& tbody tr:nth-child(2n)': {
                                    backgroundColor: 'custom.dark',
                                },
                                '& td:first-of-type': { textAlign: 'left' },
                                '& td:nth-of-type(3)': {
                                    borderRight: '1px solid white',
                                },
                                '& colgroup col': {
                                    wordBreak: 'break-all',
                                    whiteSpace: 'pre-line',
                                },
                                '& colgroup col:nth-of-type(1)': {
                                    width: '100px',
                                    maxWidth: '100px',
                                },
                                '& colgroup col:nth-of-type(2)': {
                                    width: '25px',
                                    maxWidth: '25px',
                                },
                                '& colgroup col:nth-of-type(3)': {
                                    width: '75px',
                                    maxWidth: '75px',
                                },
                                '& colgroup col:nth-of-type(n+4):nth-of-type(-n+10)':
                                    { width: '25px', maxWidth: '25px' },
                                '& colgroup col:nth-of-type(n+11):nth-of-type(-n+12)':
                                    { width: '35px', maxWidth: '35px' },
                            },
                            '& table#pitchers': {
                                '& th, & td': { padding: '5px' },
                                '& tbody td, & tfoot td': {
                                    textAlign: 'center',
                                },
                                '& td:first-of-type': { textAlign: 'left' },
                                '& td:nth-of-type(2)': {
                                    borderRight: '1px solid white',
                                },
                                '& tbody tr:nth-child(2n)': {
                                    backgroundColor: 'custom.dark',
                                },
                                '& colgroup col': {
                                    wordBreak: 'break-all',
                                    whiteSpace: 'pre-line',
                                },
                                '& colgroup col:nth-of-type(1)': {
                                    width: '175px',
                                    maxWidth: '175px',
                                },
                                '& colgroup col:nth-of-type(2)': {
                                    width: '25px',
                                    maxWidth: '25px',
                                },
                                '& colgroup col:nth-of-type(n+3):nth-of-type(-n+10)':
                                    { width: '30px', maxWidth: '30px' },
                            },
                            '& table#boxscore th, & table#pitching th, & table#pitching td, & table#pitchers th':
                                {
                                    border: '1px solid white',
                                    textAlign: 'center',
                                },
                        }}
                    >
                        <Boxscore
                            highlightedPlayer={undefined}
                            setSelectedPlayer={setSelectedPlayer}
                        />
                    </Box>
                </Grid>
                <Grid>
                    <Tabs
                        value={getTabValue(tabValue)}
                        onChange={(e, newValue) => {
                            setTabValue(newValue);
                        }}
                        sx={{ mb: 4.5 }}
                    >
                        <Tab label="Plays" value={'Plays'} />
                        <Tab label="News" value={'News'} />
                        <Tab label="Media" value={'Media'} />
                        <Tab label="Stats" value={'Stats'} />
                        <Tab
                            label="Win Probability"
                            value={'Win Probability'}
                        />
                    </Tabs>
                    <Box sx={{ width: '100%' }}>
                        {selectedGame ? (
                            <>
                                {getTabValue(tabValue) === 'Plays' && (
                                    <Plays key={selectedGame} />
                                )}
                                {getTabValue(tabValue) === 'News' && (
                                    <GameArticle key={selectedGame} />
                                )}
                                {getTabValue(tabValue) === 'Media' && (
                                    <GameMedia key={selectedGame} />
                                )}
                                {getTabValue(tabValue) === 'Stats' && (
                                    <GameStats key={selectedGame} />
                                )}
                                {getTabValue(tabValue) ===
                                    'Win Probability' && (
                                    <WinProb key={selectedGame} />
                                )}
                            </>
                        ) : (
                            <>
                                <GameTabContent>
                                    <Typography variant="h5">
                                        Select a game
                                    </Typography>
                                </GameTabContent>
                            </>
                        )}
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
    );
};
