import { Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { useBasedash } from '../../context/BasedashContext';
import { AllPlayers } from './AllPlayers.tsx';
import { PlayerStats } from './PlayerStats';
import { Rosters } from './Rosters';

export const Players = () => {
    const { setSelectedPlayer } = useBasedash();

    const [teamViewTab, setTeamViewTab] = useState('Roster');

    const handleTeamViewChange = (
        _event: React.SyntheticEvent,
        value: string
    ) => {
        setSelectedPlayer(null);
        setTeamViewTab(value);
    };

    return (
        <>
            <Tabs
                value={teamViewTab}
                onChange={handleTeamViewChange}
                sx={{ mb: 5 }}
            >
                <Tab label="All Players" value={'All Players'} />
                <Tab label="Roster" value={'Roster'} />
                <Tab label="Player" value={'Player'} />
            </Tabs>
            {teamViewTab === 'All Players' && (
                <AllPlayers setTeamViewTab={setTeamViewTab} />
            )}
            {teamViewTab === 'Roster' && (
                <Rosters setTeamViewTab={setTeamViewTab} />
            )}
            {teamViewTab === 'Player' && <PlayerStats />}
        </>
    );
};
