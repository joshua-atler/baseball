import { Tab, Tabs } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';

import { AllPlayers } from './AllPlayers.tsx';
import { PlayerStats } from './PlayerStats';
import { Rosters } from './Rosters';

export const Players = () => {
    const location = useLocation();

    const isStaticRoute = [
        '/players/all-players',
        '/players/rosters',
        '/players/player',
    ].includes(location.pathname);

    const currentTab =
        location.pathname === '/players'
            ? '/players/all-players'
            : isStaticRoute
              ? location.pathname
              : '/players/player';

    return (
        <>
            <Tabs value={currentTab} sx={{ pl: 4, mb: 4 }}>
                <Tab
                    label="All Players"
                    component={Link}
                    to="/players/all-players"
                    value="/players/all-players"
                />
                <Tab
                    label="rosters"
                    component={Link}
                    to="/players/rosters"
                    value="/players/rosters"
                />
                <Tab
                    label="Player"
                    component={Link}
                    to="/players/player"
                    value="/players/player"
                />
            </Tabs>
            <Routes>
                <Route index element={<Navigate to="all-players" replace />} />
                <Route path="all-players" element={<AllPlayers />} />
                <Route path="rosters" element={<Rosters />} />
                <Route path=":playerId" element={<PlayerStats />} />
            </Routes>
        </>
    );
};
