import * as React from 'react';

import { Box, Typography, Button, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
import GamesList from './GamesList'
import Boxscore from "./Boxscore"
import Plays from './Plays'



export default function Games() {
    const [selectedGame, setSelectedGame] = React.useState(null);


    return (
        <>
            <Grid container spacing={2} id="games-grid">
                <Grid>
                    <GamesList setSelectedGame={setSelectedGame} />
                </Grid>
                {/* <Divider orientation="vertical" flexItem sx={{ height: "100%", margin: "0 16px" }} /> */}
                <Grid>
                    <Boxscore selectedGame={selectedGame} />
                </Grid>
                <Grid>
                    <Plays selectedGame={selectedGame} />
                </Grid>
            </Grid>
        </>
    )
}
