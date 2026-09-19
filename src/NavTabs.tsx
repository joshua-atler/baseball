import { Tab, Tabs } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

export const NavTabs = () => {
    const location = useLocation();

    const currentTab = '/' + location.pathname.split('/')[1];

    return (
        <Tabs value={currentTab} sx={{ pl: 4 }}>
            <Tab label="Games" component={Link} to="/games" value="/games" />
            <Tab
                label="Players"
                component={Link}
                to="/players"
                value="/players"
            />
            <Tab label="News" component={Link} to="/news" value="/news" />
            <Tab label="Stats" component={Link} to="/stats" value="/stats" />
            <Tab
                label="Standings"
                component={Link}
                to="/standings"
                value="/standings"
            />
            <Tab
                label="Settings"
                component={Link}
                to="/settings"
                value="/settings"
            />
        </Tabs>
    );
};
