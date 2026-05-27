// @ts-nocheck

import { useEffect, useState, useCallback } from 'react';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import Grid from '@mui/material/Grid2';

import Rosters from './Rosters';
import PlayerStats from './PlayerStats';
import { useBasedash } from '../../context/BasedashContext';

import { TeamSelect } from '../../components/TeamSelect.tsx';


export default function Players() {
    const {
        selectedPlayer,
        setSelectedPlayer,
        setSelectedGame
    } = useBasedash();

    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const handleTeamChange = useCallback((val) => {
        if (val.length === 1) {
            setSelectedTeam(val[0]);
        } else {
            setSelectedTeam(null);
        }
    }, []);

    return (
        <>
            {/* <TeamSelect
                currentValue={selectedTeam}
                onTeamChange={handleTeamChange}
                multiple={false} /> */}
            <Rosters setSelectedPlayer={setSelectedPlayer} />
            {/* <Grid container spacing={2}>
                <Grid xs={12}>
                    <Rosters setSelectedPlayer={setSelectedPlayer} />
                </Grid>
                <Grid xs={12}>
                    <PlayerStats selectedPlayer={selectedPlayer} setSelectedGame={setSelectedGame} />
                </Grid>
            </Grid> */}
        </>
    )
}
