import { Link } from 'react-router-dom';
import { Box, Toolbar, Typography, Chip, Avatar } from '@mui/material';
import backgroundImage from './assets/baseballs.jpg';


export const Header = () => {
    return (
        <>
            <Box
                sx={{
                    backgroundImage: `url(${backgroundImage})`,
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
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        Basedash
                    </Link>
                </Typography>
                <Box
                    sx={{
                        // backgroundImage: `url(${BasedashLogo})`,
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
                <Chip
                    component="a"
                    href="https://reddit.com/r/mlb"
                    target="_blank"
                    clickable
                    avatar={
                        <Avatar
                            src="https://www.redditstatic.com/desktop2x/img/favicon/apple-icon-57x57.png"
                            alt="Reddit"
                        />
                    }
                    label="r/mlb"
                    variant="outlined"
                    sx={{
                        textDecoration: 'none',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        },
                    }}
                />
            </Toolbar>
        </>
    )
}