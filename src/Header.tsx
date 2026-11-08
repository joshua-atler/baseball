import { Box, Toolbar, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import baseballsBackground from './assets/baseballs.jpg';
import basedashLogo from './assets/basedash.png';

export const Header = () => {
    return (
        <>
            <Box
                sx={{
                    backgroundImage: `url(${baseballsBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '64px',
                    m: 0,
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            />
            <Toolbar disableGutters sx={{ px: 4 }}>
                <Link
                    to="/games"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                        color: 'inherit',
                        userSelect: 'none',
                    }}
                >
                    <Box
                        sx={{
                            backgroundImage: `url(${basedashLogo})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            width: 64,
                            height: 64,
                            mr: 2,
                        }}
                    />
                    <Typography
                        variant="h5"
                        noWrap
                        component="div"
                        sx={{ fontWeight: 700 }}
                    >
                        BaseDash
                    </Typography>
                </Link>
            </Toolbar>
        </>
    );
};
