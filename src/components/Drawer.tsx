import * as React from 'react'

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import SettingsIcon from '@mui/icons-material/Settings';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball'
import AssessmentIcon from '@mui/icons-material/Assessment'
import GroupIcon from '@mui/icons-material/Group'
import TableViewIcon from '@mui/icons-material/TableView'

import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom'

const drawerWidth = 240;

export default function PermanentDrawerLeft() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}
            >
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                            Basedash
                        </Link>
                    </Typography>
                </Toolbar>
                <Divider />
                <List>
                    {['Games', 'Stats', 'Rosters', 'Standings'].map((text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton
                                component={Link}
                                to={`/${text.toLowerCase().replace(' ', '-')}`}
                                sx={{
                                    backgroundColor: isActive(`/${text.toLowerCase().replace(' ', '-')}`) ? '#303f9f' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: '#303f9f',
                                    },
                                    color: isActive(`/${text.toLowerCase().replace(' ', '-')}`) ? '#64b5f6' : 'inherit',
                                }}
                            >
                                <ListItemIcon>
                                    {text === 'Games' && <SportsBaseballIcon />}
                                    {text === 'Stats' && <AssessmentIcon />}
                                    {text === 'Rosters' && <GroupIcon />}
                                    {text === 'Standings' && <TableViewIcon />}
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List>
                    {['Settings'].map((text, index) => (
                        <ListItem key={text} disablePadding>
                            <ListItemButton
                                component={Link}
                                to={`/${text.toLowerCase().replace(' ', '-')}`}
                                sx={{
                                    backgroundColor: isActive(`/${text.toLowerCase().replace(' ', '-')}`) ? '#303f9f' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: '#303f9f',
                                    },
                                    color: isActive(`/${text.toLowerCase().replace(' ', '-')}`) ? '#64b5f6' : 'inherit',
                                }}
                            >
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </Box>
    );
}
