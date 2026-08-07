import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';

import { GameTabContent } from '../../components/GameTabContent.tsx';
import { TeamLogo } from '../../components/TeamLogo.tsx';
import { useBasedash } from '../../context/BasedashContext.tsx';
import { fetchGame } from '../../services/gamesService.ts';
import { StatsRow, TeamGameStats } from '../../types/gameStats.ts';
import { StatsMode } from '../../types/stats.ts';
import { transformGameStats } from '../../utils/gameTransformers.ts';

const lowerIsBetterStats = {
    hitting: [
        'caughtStealing',
        'groundedIntoDoublePlay',
        'groundedIntoTriplePlay',
        'leftOnBase',
        'pickoffs',
        'atBatsPerHomeRun',
        'strikeOuts',
        'flyOuts',
        'groundOuts',
        'popOuts',
        'lineOuts',
        'airOuts',
    ],
    pitching: [
        'runs',
        'earnedRuns',
        'era',
        'whip',
        'hits',
        'doubles',
        'triples',
        'homeRuns',
        'rbi',
        'baseOnBalls',
        'intentionalWalks',
        'hitByPitch',
        'wildPitches',
        'balks',
        'balls',
        'pitchesPerInning',
        'numberOfPitches',
        'pitchesThrown',
        'obp',
        'stolenBases',
        'stolenBasePercentage',
        'runsScoredPer9',
        'homeRunsPer9',
        'inheritedRunnersScored',
        'sacBunts',
        'sacFlies',
        'passedBall',
    ],
    fielding: ['errors', 'passedBall', 'stolenBases', 'stolenBasePercentage'],
};

const formatLabel = (str: string) => {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (match) => match.toUpperCase());
};

const getWinner = (row: StatsRow, statsMode: StatsMode) => {
    const away = Number(row.away);
    const home = Number(row.home);

    if (Number.isNaN(away) || Number.isNaN(home)) {
        return null;
    }

    if (away === home) return null;

    const isLowerBetter = lowerIsBetterStats[statsMode].includes(row.stat);

    if (isLowerBetter) {
        return away < home ? 'away' : 'home';
    } else {
        return away > home ? 'away' : 'home';
    }
};

export const GameStats = () => {
    const theme = useTheme();
    const { selectedGame } = useBasedash();
    const [statsMode, setStatsMode] = useState<StatsMode>('hitting');

    const handleModeChange = (
        _event: React.MouseEvent<HTMLElement>,
        value: StatsMode
    ) => {
        setStatsMode(value);
    };

    const [gameStats, setGameStats] = useState<TeamGameStats | null>(null);

    useEffect(() => {
        const getTeamStats = async () => {
            if (!selectedGame) {
                setGameStats(null);
                return;
            }

            try {
                const gameContent = await fetchGame(selectedGame);
                const formattedTeamStats = transformGameStats(gameContent);
                setGameStats(formattedTeamStats);
            } catch (error) {
                setGameStats(null);
                console.error('Team stats fetch failed: ', error);
            }
        };

        getTeamStats();
    }, [selectedGame]);

    const tableRows: StatsRow[] = useMemo(() => {
        if (!gameStats) return [];

        const currentAwayStats = gameStats.away.stats[statsMode];
        const currentHomeStats = gameStats.home.stats[statsMode];

        type CurrentStatKey = keyof typeof currentAwayStats;

        return (
            Object.entries(currentAwayStats) as [
                CurrentStatKey,
                number | string,
            ][]
        ).map(([stat, value]) => ({
            stat: stat,
            away: value,
            home: currentHomeStats[stat],
        }));
    }, [gameStats, statsMode]);

    return (
        <GameTabContent>
            {gameStats ? (
                <>
                    <ToggleButtonGroup
                        sx={{ mb: 4 }}
                        fullWidth
                        color="primary"
                        value={statsMode}
                        exclusive
                        onChange={handleModeChange}
                    >
                        <ToggleButton value="hitting">Hitting</ToggleButton>
                        <ToggleButton value="pitching">Pitching</ToggleButton>
                        <ToggleButton value="fielding">Fielding</ToggleButton>
                    </ToggleButtonGroup>
                    <TableContainer
                        component={Paper}
                        sx={{ overflow: 'hidden' }}
                    >
                        <Table
                            size="medium"
                            sx={{
                                border: '0px !important',
                                tableLayout: 'fixed',
                                width: '100% !important',
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: '33%' }}>
                                        <Typography
                                            variant="h5"
                                            component="span"
                                        >
                                            Stat
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ width: '33%' }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <TeamLogo
                                                teamAbbr={
                                                    gameStats.away.team.abbr
                                                }
                                                size={30}
                                            />
                                            <Typography
                                                variant="h5"
                                                component="span"
                                            >
                                                {gameStats.away.team.abbr}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            width: '33%',
                                            verticalAlign: 'middle',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <TeamLogo
                                                teamAbbr={
                                                    gameStats.home.team.abbr
                                                }
                                                size={30}
                                            />
                                            <Typography
                                                variant="h5"
                                                component="span"
                                            >
                                                {gameStats.home.team.abbr}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableRows.map((row) => {
                                    const winner = getWinner(row, statsMode);
                                    return (
                                        <TableRow key={row.stat}>
                                            <TableCell>
                                                {formatLabel(row.stat)}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    ...(winner === 'away' && {
                                                        bgcolor:
                                                            theme.palette.custom
                                                                .highlightGreen,
                                                    }),
                                                }}
                                            >
                                                {row.away}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    ...(winner === 'home' && {
                                                        bgcolor:
                                                            theme.palette.custom
                                                                .highlightGreen,
                                                    }),
                                                }}
                                            >
                                                {row.home}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            ) : (
                <>
                    <Typography variant="h5">No Stats</Typography>
                </>
            )}
        </GameTabContent>
    );
};
