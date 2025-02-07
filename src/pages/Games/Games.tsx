import * as React from 'react';

import { Box, Typography, Button, Divider } from "@mui/material";
import Grid from '@mui/material/Grid2';
import GamesList from './GamesList'
import Boxscore from "./Boxscore";



export default function Games() {
    const [selectedGame, setSelectedGame] = React.useState(null);


    return (
        <>
            <Grid container spacing={1} id="games-grid">
                <Grid>
                    <GamesList setSelectedGame={setSelectedGame} />
                </Grid>
                {/* <Divider orientation="vertical" flexItem sx={{ height: "100%", margin: "0 16px" }} /> */}
                <Grid>
                    <Boxscore selectedGame={selectedGame} />
                </Grid>
                <Grid>
                    <h1>Plays</h1>
                </Grid>
            </Grid>
        </>
    )
}
