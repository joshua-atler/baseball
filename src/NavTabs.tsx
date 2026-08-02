import { TabContext, TabList } from '@mui/lab';
import { Tab } from '@mui/material';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate, } from 'react-router-dom';

export const NavTabs = () => {

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const paths = ['/games', '/players', '/news', '/stats', '/standings', '/settings'];

        if (!paths.includes(location.pathname) && location.pathname !== '/games') {
            navigate('/games', { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <TabContext value={location.pathname}>
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