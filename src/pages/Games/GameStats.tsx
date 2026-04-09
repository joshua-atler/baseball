// @ts-nocheck

import { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import ReactPlayer from 'react-player';

import {
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { Consts } from './consts.ts';
import { useBasedash } from '../../context/BasedashContext.tsx';
import { fetchGame } from '../../services/gamesService.ts';
import { GameTabContent } from '../../components/GameTabContent.tsx';
import { transformGameStats } from '../../utils/gameTransformers.ts';

type StatsMode = "batting" | "pitching" | "fielding";
interface StatsRow {
    stat: string,
    away: number,
    home: number
};

const lowerIsBetterStats = {
    batting: [
        'caughtStealing',
        'groundedIntoDoublePlay',
        'groundedIntoTriplePlay',
        'leftOnBase',
        'pickoffs',
        'atBatsPerHomeRun',
        'strikeOuts',
        'flyOuts', 'groundOuts', 'popOuts', 'lineOuts', 'airOuts'
    ],
    pitching: [
        'runs', 'earnedRuns', 'era', 'whip', 'hits',
        'doubles', 'triples', 'homeRuns', 'rbi',
        'baseOnBalls', 'intentionalWalks', 'hitByPitch',
        'wildPitches', 'balks', 'balls',
        'pitchesPerInning', 'numberOfPitches', 'pitchesThrown',
        'obp', 'stolenBases', 'stolenBasePercentage',
        'runsScoredPer9', 'homeRunsPer9',
        'inheritedRunnersScored', 'sacBunts', 'sacFlies', 'passedBall'
    ],
    fielding: [
        'errors',
        'passedBall',
        'stolenBases',
        'stolenBasePercentage'
    ]
}

const formatLabel = (str) => {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (match) => match.toUpperCase());
};

const getWinner = (row, statsMode) => {
    const away = parseFloat(row.away);
    const home = parseFloat(row.home);

    if (isNaN(away) || isNaN(home)) {
        return null;
    }

    if (away === home) return null;

    const isLowerBetter = lowerIsBetterStats[statsMode].includes(row.stat);

    if (isLowerBetter) {
        return away < home ? 'away' : 'home';
    } else {
        return away > home ? 'away' : 'home';
    }
}

export default function GameStats() {
    const theme = useTheme();
    const { selectedGame } = useBasedash();
    const [statsMode, setStatsMode] = useState<StatsMode>('batting');

    const handleModeChange = (event: SelectChangeEvent) => {
        setStatsMode(event.target.value as string);
    };

    const [gameStats, setGameStats] = useState(null);
    // const [tableRows, setTableRows] = useState([]);

    useEffect(() => {
        const getTeamStats = async () => {
            if (!selectedGame) {
                setGameStats(null);
                return;
            };

            try {
                const gameContent = await fetchGame(selectedGame);
                const formattedTeamStats = transformGameStats(gameContent);
                setGameStats(formattedTeamStats);
            } catch (error) {
                setGameStats(null);
                console.error("Team stats fetch failed: ", error);
            }
        };

        getTeamStats();
    }, [selectedGame]);

    const tableRows = useMemo(() => {
        if (!gameStats) return [];

        return Object.entries(gameStats.away.stats[statsMode]).map(([stat, value]) => ({
            stat: stat,
            away: value,
            home: gameStats.home.stats[statsMode][stat]
        }));
    }, [gameStats, statsMode]);

    return (
        <GameTabContent>
            {gameStats ?
                <>
                    <ToggleButtonGroup
                        sx={{ mb: 4 }}
                        fullWidth
                        color="primary"
                        value={statsMode}
                        exclusive
                        onChange={handleModeChange}
                    >
                        <ToggleButton value="batting">Batting</ToggleButton>
                        <ToggleButton value="pitching">Pitching</ToggleButton>
                        <ToggleButton value="fielding">Fielding</ToggleButton>
                    </ToggleButtonGroup>
                    <TableContainer component={Paper} sx={{ overflow: 'hidden' }}>
                        <Table size="medium" sx={{ border: '0px !important', tableLayout: 'fixed', width: '100% !important' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: '33%' }}><Typography variant="h5" component="span">Stat</Typography></TableCell>
                                    <TableCell sx={{ width: '33%' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <img width="30" height="30" className="logo" src={gameStats.away.team.logo} />
                                            <Typography variant="h5" component="span">{gameStats.away.team.abbr}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ width: '33%', verticalAlign: 'middle' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <img width="30" height="30" className="logo" src={gameStats.home.team.logo} />
                                            <Typography variant="h5" component="span">{gameStats.home.team.abbr}</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    tableRows.map((row, i) => {
                                        const winner = getWinner(row, statsMode);
                                        return <TableRow key={row.stat}>
                                            <TableCell>{formatLabel(row.stat)}</TableCell>
                                            <TableCell sx={{ bgcolor: (winner === 'away') && theme.palette.custom.highlightGreen }}>{row.away}</TableCell>
                                            <TableCell sx={{ bgcolor: ((winner === 'home')) && theme.palette.custom.highlightGreen }}>{row.home}</TableCell>
                                        </TableRow>
                                    })
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </> :
                <>
                    <Typography variant="h5">No Stats</Typography>
                </>}
        </GameTabContent>
    )
}
