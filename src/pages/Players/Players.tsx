// @ts-nocheck

import * as React from 'react';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import Grid from '@mui/material/Grid2';

import Rosters from './Rosters';
import PlayerStats from './PlayerStats';
import { useBasedash } from '../../context/BasedashContext';



export default function Players() {
    const {
        selectedPlayer,
        setSelectedPlayer,
        setSelectedGame
    } = useBasedash();

    return (
        <>
            <Grid container spacing={2}>
                <Grid>
                    <Rosters setSelectedPlayer={setSelectedPlayer} />
                </Grid>
                <Grid>
                    {/* <PlayerStats selectedPlayer={selectedPlayer} setSelectedGame={setSelectedGame} /> */}
                </Grid>
            </Grid>
        </>
    )
}
