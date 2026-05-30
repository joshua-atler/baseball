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
        selectedTeam,
        setSelectedTeam
    } = useBasedash();

    const handleTeamChange = useCallback((val) => {
        if (val.length === 1) {
            setSelectedTeam(val[0]);
        } else {
            setSelectedTeam(null);
        }
    }, []);

    const [teamViewTab, setTeamViewTab] = useState('Roster');

    const handleTeamViewChange = (event, newValue) => {
        setTeamViewTab(newValue);
    };

    return (
        <>
            <Tabs value={teamViewTab} onChange={handleTeamViewChange} sx={{ mb: 5 }}>
                <Tab label='Roster' value={'Roster'} />
                <Tab label='Player' value={'Player'} />
            </Tabs>
            {teamViewTab === 'Roster' &&
                <Rosters setTeamViewTab={setTeamViewTab} />
            }
            {teamViewTab === 'Player' &&
                <>
                    <PlayerStats />
                </>
            }
        </>
    )
}
