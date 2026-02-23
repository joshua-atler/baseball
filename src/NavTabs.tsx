import { Link, useLocation } from 'react-router-dom';
import { Tab } from '@mui/material';

import { TabContext, TabList } from '@mui/lab';

export const NavTabs = () => {
    const location = useLocation();

    const paths = ['/games', '/players', '/news', '/stats', '/standings', '/settings'];
    let pathname = location.pathname;
    if (!paths.includes(pathname)) {
        pathname = '/games';
    }

    return (
        <TabContext value={pathname}>
            <TabList sx={{ pl: 4 }}>
                <Tab label="Games" component={Link} to="/games" value="/games" />
                <Tab label="Players" component={Link} to="/players" value="/players" />
                <Tab label="News" component={Link} to="/news" value="/news" />
                <Tab label="Stats" component={Link} to="/stats" value="/stats" />
                <Tab label="Standings" component={Link} to="/standings" value="/standings" />
                <Tab label="Settings" component={Link} to="/settings" value="/settings" />
            </TabList>
        </TabContext>
    );
}