// @ts-nocheck

import * as React from 'react';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import Grid from '@mui/material/Grid2';

import Rosters from './Rosters';
import PlayerStats from './PlayerStats';


export default function Players({ selectedPlayer, setSelectedPlayer, setSelectedGame }) {
    return (
        <>
            <Grid container spacing={2}>
                <Grid>
                    <Rosters setSelectedPlayer={setSelectedPlayer} />
                </Grid>
                <Grid>
                    <PlayerStats selectedPlayer={selectedPlayer} setSelectedGame={setSelectedGame} />
                </Grid>
            </Grid>
        </>
    )
}
