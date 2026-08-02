import { Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { useBasedash } from '../../context/BasedashContext';
import AllPlayers from './AllPlayers.tsx';
import PlayerStats from './PlayerStats';
import Rosters from './Rosters';


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
