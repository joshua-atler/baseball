import { Box, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import baseballsBackground from './assets/baseballs.jpg';
import basedashLogo from './assets/basedash_logo.png';


export const Header = () => {
    return (
        <>
            <Box
                sx={{
                    backgroundImage: `url(${baseballsBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '64px',
                    mb: 0,
                    p: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            />
            <Toolbar>
                <Typography variant="h4" noWrap component="div">
                    <Link to="/games" style={{ textDecoration: 'none', color: 'inherit', userSelect: 'none' }}>
                        Basedash
                    </Link>
                </Typography>
                <Box
                    sx={{
                        backgroundImage: `url(${basedashLogo})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        width: '100px',
                        height: '100px',
                        ml: 2,
                        mr: 4,
                        p: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                    }}
                />
            </Toolbar>
        </>
    )
}