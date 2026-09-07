import {
    Box,
    Typography,
    Select,
    SelectChangeEvent,
    MenuItem,
    FormControl,
    LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useEffect, useState } from 'react';
import { fetchSeason } from '../services/standingsService';
import { Temporal } from '@js-temporal/polyfill';
import { fetchGame, fetchSchedule } from '../services/gamesService';
import { AwayHomeScoreChart } from '../charts/AwayHomeScoreChart';
import { HitsRunsChart } from '../charts/HitsRunsChart';
import { StrikeoutsRunsChart } from '../charts/StrikeoutsRunsChart';
import { PitchesWalksChart } from '../charts/PitchesWalksChart';

export const Charts = () => {
    const [chartsYear, setChartsYear] = useState(
        Temporal.Now.plainDateISO().year
    );
    const [completedCount, setCompletedCount] = useState(0);
    const [seasonGamesCount, setSeasonGamesCount] = useState(0);
    const [seasonGames, setSeasonGames] = useState([]);

    const firstYear = 2010;

    const handleYearChange = (event: SelectChangeEvent<number>) => {
        setChartsYear(event.target.value as number);
    };

    useEffect(() => {
        let isCancelled = false;

        async function getSeasonInfo() {
            setCompletedCount(0);
            setSeasonGamesCount(0);

            try {
                const seasonInfo = await fetchSeason(chartsYear);
                if (isCancelled) return;

                const regularSeasonStartDate =
                    seasonInfo.seasons[0].regularSeasonStartDate;
                const regularSeasonEndDate =
                    seasonInfo.seasons[0].regularSeasonEndDate;

                const { dates: seasonDates } = await fetchSchedule(
                    regularSeasonStartDate,
                    regularSeasonEndDate
                );
                if (isCancelled) return;

                const allGamePks = seasonDates.flatMap((date: any) =>
                    date.games.map((game: any) => game.gamePk)
                );

                setSeasonGamesCount(allGamePks.length);

                const fetchGamesWithConcurrency = async (
                    pks: number[],
                    hydrations: string[] = [],
                    concurrencyLimit = 10
                ) => {
                    const results: any[] = [];
                    let index = 0;

                    const worker = async () => {
                        while (index < pks.length && !isCancelled) {
                            // while (index < 100 && !isCancelled) {
                            const currentIndex = index++;
                            const gamePk = pks[currentIndex];

                            try {
                                results[currentIndex] = await fetchGame(
                                    gamePk,
                                    hydrations
                                );
                            } catch (err) {
                                console.error(
                                    `Failed to fetch game ${gamePk}`,
                                    err
                                );
                                results[currentIndex] = null;
                            } finally {
                                if (!isCancelled) {
                                    setCompletedCount((prev) => prev + 1);
                                }
                            }
                        }
                    };

                    const workers = Array.from(
                        { length: Math.min(concurrencyLimit, pks.length) },
                        () => worker()
                    );
                    await Promise.all(workers);

                    return results;
                };

                const seasonGames = await fetchGamesWithConcurrency(allGamePks);
                setSeasonGames(seasonGames);
                // if (!isCancelled) {
                //     console.log('Finished fetching season games:', seasonGames);
                // }
            } catch (error) {
                if (!isCancelled) {
                    console.error('Failed to load season data:', error);
                }
            }
        }

        getSeasonInfo();

        return () => {
            isCancelled = true;
        };
    }, [chartsYear]);

    const progressPercent =
        seasonGamesCount > 0
            ? Math.round((completedCount / seasonGamesCount) * 100)
            : 0;

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center" mt={2} mb={3}>
                <Grid>
                    <Typography>Year</Typography>
                </Grid>
                <Grid>
                    <Box sx={{ minWidth: 200, width: 200 }}>
                        <FormControl fullWidth>
                            <Select
                                displayEmpty
                                value={chartsYear}
                                onChange={handleYearChange}
                            >
                                {Array.from({
                                    length:
                                        Temporal.Now.plainDateISO().year -
                                        firstYear +
                                        1,
                                }).map((_, i) => {
                                    const year =
                                        Temporal.Now.plainDateISO().year - i;
                                    return (
                                        <MenuItem key={year} value={year}>
                                            {year}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
            </Grid>

            <Box sx={{ maxWidth: 400 }}>
                <Typography variant="body2" color="text.secondary" mb={1}>
                    Completed Count: {completedCount} / {seasonGamesCount} (
                    {progressPercent}%)
                </Typography>
                <LinearProgress variant="determinate" value={progressPercent} />
            </Box>

            {seasonGames.length > 0 && (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            // alignItems: 'center',
                            gap: 4,
                            mb: 2,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '600px',
                                width: '600px',
                            }}
                        >
                            <Typography variant="h5">
                                Home Score vs. Away Score
                            </Typography>
                            <AwayHomeScoreChart seasonGames={seasonGames} />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '600px',
                                width: '600px',
                            }}
                        >
                            <Typography variant="h5">
                                Hit Differential vs. Run Differential
                            </Typography>
                            <HitsRunsChart seasonGames={seasonGames} />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '600px',
                                width: '600px',
                            }}
                        >
                            <Typography variant="h5">
                                Strikeout Differential vs. Run Differential
                            </Typography>
                            <StrikeoutsRunsChart seasonGames={seasonGames} />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '600px',
                                width: '600px',
                            }}
                        >
                            <Typography variant="h5">
                                Total Pitches vs. Walks
                            </Typography>
                            <PitchesWalksChart seasonGames={seasonGames} />
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
};
