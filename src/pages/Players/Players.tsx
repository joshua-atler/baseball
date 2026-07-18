// @ts-nocheck

import { useEffect, useState, useCallback } from 'react';

import { Box, Typography, Tabs, Tab } from '@mui/material';
import Grid from '@mui/material/Grid2';

import AllPlayers from './AllPlayers.tsx';
import Rosters from './Rosters';
import PlayerStats from './PlayerStats';
import { useBasedash } from '../../context/BasedashContext';

import { TeamSelect } from '../../components/TeamSelect.tsx';


export default function Players() {
    const {
        selectedPlayer,
        setSelectedPlayer,
        selectedTeam,
        setSelectedTeam
    } = useBasedash();

    const [teamViewTab, setTeamViewTab] = useState('Roster');

    const handleTeamViewChange = (event, newValue) => {
        setSelectedPlayer(null);
        setTeamViewTab(newValue);
    };

    return (
        <>
            <Tabs value={teamViewTab} onChange={handleTeamViewChange} sx={{ mb: 5 }}>
                <Tab label='All Players' value={'All Players'} />
                <Tab label='Roster' value={'Roster'} />
                <Tab label='Player' value={'Player'} />
            </Tabs>
            {teamViewTab === 'All Players' &&
                <AllPlayers setTeamViewTab={setTeamViewTab} />
            }
            {teamViewTab === 'Roster' &&
                <Rosters setTeamViewTab={setTeamViewTab} />
            }
            {teamViewTab === 'Player' &&
                <PlayerStats />
            }
        </>
    )
}
