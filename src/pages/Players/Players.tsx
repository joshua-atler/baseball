// @ts-nocheck

import * as React from 'react';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import Grid from '@mui/material/Grid2';


import Rosters from './Rosters';
import PlayerStats from './PlayerStats';


export default function Players({ selectedPlayer, setSelectedPlayer, setSelectedGame }) {
    // const [selectedGame, setSelectedGame] = React.useState(null);
    // const [selectedPlayer, setSelectedPlayer] = React.useState(null);
    // const [tabValue, setTabValue] = React.useState(0);

    // console.log(selectedGame);



    return (
        <>
            {/* <Grid container spacing={2} id="games-grid"> */}
            <Grid container spacing={2}>
                <Grid>
                    <Rosters setSelectedPlayer={setSelectedPlayer} />
                </Grid>
                {/* <Divider orientation="vertical" flexItem sx={{ height: "100%", margin: "0 16px" }} /> */}
                <Grid>
                    <PlayerStats selectedPlayer={selectedPlayer} setSelectedGame={setSelectedGame} />
                </Grid>
            </Grid>
        </>
    )
}
