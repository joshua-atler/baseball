import { Temporal } from '@js-temporal/polyfill';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Card,
    CardContent,
    Chip,
    FormControlLabel,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DT from 'datatables.net-dt';
import DataTable from 'datatables.net-react';
import { useEffect, useMemo, useState } from 'react';
import { HiExternalLink } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
import 'datatables.net-dt';

// import '../../styles/dtStyle.css';
import { useHitterColumns } from '../../columns/useHitterColumns.tsx';
import { usePitcherColumns } from '../../columns/usePitcherColumns.tsx';
import { Consts } from '../../consts/consts.ts';
import { useBasedash } from '../../context/BasedashContext';
import { fetchGame } from '../../services/gamesService.ts';
import { fetchAwards, fetchPlayer } from '../../services/playerService.ts';
import {
    Award,
    HitterStats,
    PitcherStats,
    PitcherYearDetails,
    SeasonInningsPitched,
} from '../../types/player.ts';
import {
    transformAwards,
    transformHitterStats,
    transformPitcherGameLog,
    transformPitcherPitchArsenal,
    transformPitcherPitchLog,
    transformPitcherPitchSpeeds,
    transformPitcherStats,
} from '../../utils/playerTransformers.ts';
import { HitterStatsView } from './HitterStatsView.tsx';
import { PitcherStatsView } from './PitcherStatsView.tsx';

const AwardCard = ({ award, teams, dates }) => {
    return (
        <Card>
            <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                    {award}
                </Typography>
                {teams.map((team, index) => (
                    <Box
                        key={index}
                        display="flex"
                        gap={2}
                        justifyContent="space-between"
                    >
                        <Typography variant="body1">{team}</Typography>
                        <Typography variant="body1">{dates[index]}</Typography>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
};

const Awards = ({ awards, theme }) => {
    return (
        <Accordion
            sx={{
                bgcolor: theme.palette.custom.lightGray,
            }}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <h2>Awards ({awards.length})</h2>
            </AccordionSummary>
            <AccordionDetails>
                <Box display="flex" flexWrap="wrap" gap={2}>
                    {awards.map((award, index) => (
                        <AwardCard
                            key={index}
                            award={award.name}
                            teams={award.teams}
                            dates={award.dates}
                        />
                    ))}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

const fixName = (name: string) => {
    let cleanName = name.toLowerCase();
    cleanName = cleanName.replace(/ /g, '-');
    cleanName = cleanName.replace(/'/g, '-');
    const match = cleanName.match(/\./g);
    if (match && match.length == 2) {
        cleanName = cleanName.replace(/\./, '-');
    }
    cleanName = cleanName.replace(/\./g, '');
    cleanName = cleanName.normalize('NFD');
    cleanName = cleanName.replace(/[\u0300-\u036f]/g, '').replace(/ñ/g, 'n');

    return cleanName;
};

export const PlayerStats = () => {
    const theme = useTheme();
    const { playerId } = useParams<{ playerId: string }>();
    const {
        selectedPlayer,
        setSelectedPlayer,
        selectedTeam,
        setSelectedGame,
        setSelectedGameMetadata,
    } = useBasedash();

    useEffect(() => {
        if (playerId) {
            setSelectedPlayer(parseInt(playerId));
        }
    }, [playerId, setSelectedPlayer]);

    const { pitcherStatsColumns, pitcherGameLogColumns } = usePitcherColumns();
    const { hitterStatsColumns, hitterGameLogColumns } = useHitterColumns();

    const navigate = useNavigate();

    const [playerInfo, setPlayerInfo] = useState(null);
    const playerURL =
        playerInfo === null
            ? ''
            : `https://www.mlb.com/player/${fixName(playerInfo.fullName)}-${selectedPlayer}`;
    const storyURL =
        playerInfo === null
            ? ''
            : `https://www.mlb.com/stories/player/${selectedPlayer}?storylocal=player-page-header-embed`;
    const selectedTeamLogo = selectedTeam
        ? Consts.teamInfo[selectedTeam].logo
        : '';

    const bioRows =
        playerInfo === null
            ? []
            : [
                  { label: 'Age', value: playerInfo.currentAge },
                  { label: 'Position', value: playerInfo.primaryPosition.name },
                  {
                      label: 'Birthplace',
                      value: `${playerInfo.birthCity}, ${playerInfo.birthCountry}`,
                  },
                  { label: 'Height', value: playerInfo.height },
                  { label: 'Weight', value: playerInfo.weight },
                  { label: 'MLB Debut', value: playerInfo.mlbDebutDate },
                  {
                      label: 'Bat/Throw',
                      value: `${playerInfo.batSide.code}/${playerInfo.pitchHand.code}`,
                  },
              ];

    const [awards, setAwards] = useState<Award[]>([]);

    const [pitcherStats, setPitcherStats] = useState<PitcherStats[] | null>(
        null
    );
    const [pitcherYearDetails, setPitcherYearDetails] =
        useState<PitcherYearDetails>({
            isLoading: false,
            year: null,
            pitchSpeeds: null,
            pitchArsenal: null,
            gameLog: null,
            playLog: null,
            pitchLog: null,
            error: false,
        });
    const allSeasonPitches = useMemo(() => {
        const pitchLog = pitcherYearDetails?.pitchLog;
        if (!pitchLog) return null;

        return Object.values(pitchLog).flatMap((game) =>
            Object.values(game).flat()
        );
    }, [pitcherYearDetails]);
    const [seasonInningsPitched, setSeasonInningsPitched] = useState<
        SeasonInningsPitched[]
    >([]);

    const [selectedPitcherGamePitches, setSelectedPitcherGamePitches] =
        useState(null);
    const [
        selectedPitcherGamePitchesVelocity,
        setSelectedPitcherGamePitchesVelocity,
    ] = useState(null);

    const firstYear = 2010;
    const [allYearsChecked, setAllYearsChecked] = useState(true);
    const [groupTeamsChecked, setGroupTeamsChecked] = useState(false);

    const totalPitches = pitcherYearDetails?.pitchArsenal
        ?.map((pitch) => pitch.count)
        .reduce((acc, curr) => acc + curr, 0);

    const displayedPitcherStats = useMemo(() => {
        if (pitcherStats === null) return null;

        const multiTeamYears = new Set(
            pitcherStats
                .filter((row) => row.team === '' && row.year !== 'Career')
                .map((row) => row.year)
        );

        const filteredYears = pitcherStats.filter((row) => {
            if (!multiTeamYears.has(row.year)) {
                return true;
            } else {
                if (groupTeamsChecked) {
                    return row.team === '';
                } else {
                    return row.team !== '';
                }
            }
        });

        if (allYearsChecked) {
            return filteredYears;
        } else {
            return filteredYears.filter(
                (row) =>
                    row.year === Temporal.Now.plainDateISO().year.toString()
            );
        }
    }, [pitcherStats, allYearsChecked, groupTeamsChecked]);

    const [hitterStats, setHitterStats] = useState<HitterStats[] | null>(null);

    const displayedHitterStats = useMemo(() => {
        if (hitterStats === null) return null;

        const multiTeamYears = new Set(
            hitterStats
                .filter((row) => row.team === '' && row.year !== 'Career')
                .map((row) => row.year)
        );

        const filteredYears = hitterStats.filter((row) => {
            if (!multiTeamYears.has(row.year)) {
                return true;
            } else {
                if (groupTeamsChecked) {
                    return row.team === '';
                } else {
                    return row.team !== '';
                }
            }
        });

        if (allYearsChecked) {
            return filteredYears;
        } else {
            return filteredYears.filter(
                (row) =>
                    row.year === Temporal.Now.plainDateISO().year.toString()
            );
        }
    }, [hitterStats, allYearsChecked, groupTeamsChecked]);

    const allYearsToggle = (event) => {
        setAllYearsChecked(event.target.checked);
    };

    const groupTeamsToggle = (event) => {
        setGroupTeamsChecked(event.target.checked);
    };

    useEffect(() => {
        const loadInningsPitched = async () => {
            const gamePromises = pitcherYearDetails.gameLog?.map(
                async (gameInfo) => {
                    return await fetchGame(gameInfo.gamePk);
                }
            );
            const allGames = await Promise.all(gamePromises);

            const masterOutsByInning: Record<number, number> = {};

            allGames
                .flatMap((game) => game.liveData.plays.allPlays)
                .filter(
                    (play) =>
                        play.result.isOut &&
                        play.matchup.pitcher.id === playerInfo.id
                )
                .forEach((play) => {
                    const inningNum = play.about.inning;
                    masterOutsByInning[inningNum] =
                        (masterOutsByInning[inningNum] || 0) + 1;
                });
            setSeasonInningsPitched(
                Object.entries(masterOutsByInning).map(
                    ([inningNum, totalOuts]) => {
                        return {
                            inningNum: Number(inningNum),
                            inningsPitched: Number(totalOuts[1] / 3).toFixed(2),
                        };
                    }
                )
            );
        };

        if (pitcherYearDetails.gameLog) {
            loadInningsPitched();
        } else {
            setSeasonInningsPitched([]);
        }
    }, [pitcherYearDetails.gameLog, playerInfo?.id]);

    console.log('playerInfo');
    console.log(playerInfo);

    const handlePitcherRowSelect = (_e, _dt, _type, indexes) => {
        const getPitcherYearDetails = async () => {
            console.log('displayedPitcherStats');
            console.log(displayedPitcherStats);
            const selectedYear = Number(displayedPitcherStats[indexes].year);
            setPitcherYearDetails((prev) => ({
                ...prev,
                isLoading: true,
                error: null,
            }));

            try {
                const rawPitcherYearDetails = await fetchPlayer(
                    selectedPlayer,
                    ['pitching'],
                    [
                        'pitchArsenal',
                        'gameLog',
                        'playLog',
                        'pitchLog',
                        'career',
                    ],
                    selectedYear
                );

                const rawPitcherPitchArsenal =
                    rawPitcherYearDetails.people[0].stats.filter(
                        (s) => s.type.displayName === 'pitchArsenal'
                    )[0];
                const pitcherPitchArsenal = transformPitcherPitchArsenal(
                    rawPitcherPitchArsenal
                );
                const pitcherPitchSpeeds = transformPitcherPitchSpeeds(
                    rawPitcherPitchArsenal
                );

                const rawPitcherGameLog =
                    rawPitcherYearDetails.people[0].stats.filter(
                        (s) => s.type.displayName === 'gameLog'
                    )[0].splits;

                const pitchLog = await transformPitcherPitchLog(
                    rawPitcherGameLog,
                    selectedPlayer
                );

                const gameLog =
                    await transformPitcherGameLog(rawPitcherGameLog);

                setPitcherYearDetails({
                    isLoading: false,
                    year: selectedYear,
                    pitchArsenal: pitcherPitchArsenal,
                    pitchSpeeds: pitcherPitchSpeeds,
                    gameLog: gameLog,
                    playLog: null,
                    pitchLog: pitchLog,
                    error: false,
                });
            } catch (err) {
                console.error(err);
            }
        };

        getPitcherYearDetails();
    };

    const handlePitcherRowDeselect = () => {
        setPitcherYearDetails({
            isLoading: false,
            year: null,
            pitchArsenal: null,
            pitchSpeeds: null,
            gameLog: null,
            playLog: null,
            pitchLog: null,
            error: false,
        });
    };

    const handlePitcherGameRowSelect = (e, dt, type, indexes) => {
        const selectedPitcherGame = pitcherYearDetails.gameLog[indexes].gamePk;
        setSelectedPitcherGamePitches(
            Object.values(
                pitcherYearDetails.pitchLog[selectedPitcherGame]
            ).flat()
        );
        setSelectedPitcherGamePitchesVelocity(
            Object.values(pitcherYearDetails.pitchLog[selectedPitcherGame])
                .flat()
                .map((pitch) => {
                    return {
                        ...pitch,
                        pitchTime: Date.parse(pitch.startTime),
                        velocity: pitch.pitchData.startSpeed,
                    };
                })
        );
    };

    const handlePitcherGameRowDeselect = () => {
        setSelectedPitcherGamePitches(null);
        setSelectedPitcherGamePitchesVelocity(null);
    };

    //             hittingStatsDT.row.add([
    //                 `${seasonYear}`,
    //                 `${team}`,
    //                 hittingRow['stat']['atBats'],
    //                 hittingRow['stat']['runs'],
    //                 hittingRow['stat']['hits'],
    //                 hittingRow['stat']['homeRuns'],
    //                 hittingRow['stat']['rbi'],
    //                 hittingRow['stat']['stolenBases'],
    //                 hittingRow['stat']['avg'],
    //                 hittingRow['stat']['obp'],
    //                 hittingRow['stat']['slg'],
    //                 hittingRow['stat']['ops']
    //             ]);

    useEffect(() => {
        window.handleViewGameClick = (gamePk) => {
            const matchedRow = pitcherYearDetails.gameLog.find(
                (row) => row.gamePk === gamePk
            );

            if (matchedRow) {
                setSelectedGame(gamePk);
                setSelectedGameMetadata({
                    tickets: matchedRow.gameMetadata?.tickets || null,
                    broadcasts: matchedRow.gameMetadata?.broadcasts || null,
                    seriesStatus: matchedRow.gameMetadata?.seriesStatus || null,
                });
                navigate('/games');
            }
        };

        return () => {
            delete window.handleViewGameClick;
        };
    }, [
        pitcherYearDetails.gameLog,
        navigate,
        setSelectedGame,
        setSelectedGameMetadata,
    ]);

    useEffect(() => {
        const getPlayer = async () => {
            if (selectedPlayer === null) {
                setPlayerInfo(null);
                setAwards([]);
                setPitcherStats(null);
                setHitterStats(null);
                return;
            }

            const rawPlayerInfo = await fetchPlayer(selectedPlayer);
            const playerInfo = rawPlayerInfo.people[0];
            setPlayerInfo(playerInfo);

            const seasonPitchingStats = Array.from({
                length: Temporal.Now.plainDateISO().year - firstYear + 1,
            }).map((_, i) => {
                return fetchPlayer(
                    selectedPlayer,
                    ['pitching'],
                    ['season', 'seasonAdvanced'],
                    Temporal.Now.plainDateISO().year - i
                );
            });
            const careerPitchingStats = fetchPlayer(
                selectedPlayer,
                ['pitching'],
                ['career', 'careerAdvanced']
            );
            const rawPitcherStats = await Promise.all([
                ...seasonPitchingStats,
                careerPitchingStats,
            ]);
            const pitcherStats = transformPitcherStats(rawPitcherStats);
            setPitcherStats(pitcherStats);

            const seasonHittingStats = Array.from({
                length: Temporal.Now.plainDateISO().year - firstYear + 1,
            }).map((_, i) => {
                return fetchPlayer(
                    selectedPlayer,
                    ['hitting'],
                    ['season', 'seasonAdvanced'],
                    Temporal.Now.plainDateISO().year - i
                );
            });
            const careerHittingStats = fetchPlayer(
                selectedPlayer,
                ['hitting'],
                ['career', 'careerAdvanced']
            );
            const rawHitterStats = await Promise.all([
                ...seasonHittingStats,
                careerHittingStats,
            ]);
            const hitterStats = transformHitterStats(rawHitterStats);
            setHitterStats(hitterStats);

            const rawAwards = await fetchAwards(selectedPlayer);
            if (rawAwards.people[0].awards) {
                const awards = transformAwards(rawAwards);
                setAwards(awards);
            } else {
                setAwards([]);
            }
        };

        getPlayer();
    }, [selectedPlayer]);

    return (
        <>
            {/* <StatsModal open={modalOpen} handleClose={handleModalClose} modalData={modalData} /> */}
            {playerInfo && (
                <Box
                    sx={{ bgcolor: theme.palette.custom.darkGray, padding: 4 }}
                >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="h4">
                            {playerInfo.fullName}
                        </Typography>
                        <Typography variant="h4">
                            #{playerInfo.primaryNumber}
                        </Typography>
                        <img
                            src={selectedTeamLogo}
                            style={{ width: 40, height: 40 }}
                        />
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                        <Stack direction="column">
                            <Box sx={{ display: 'flex' }}>
                                <img
                                    src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${selectedPlayer}/headshot/silo/current`}
                                />
                                <Box>
                                    <Table
                                        sx={{
                                            border: 'none !important',
                                            maxWidth: 350,
                                            '& td': { border: 'none', py: 0.5 },
                                        }}
                                        size="small"
                                    >
                                        <TableBody sx={{ border: 'none' }}>
                                            {bioRows.map((row) => (
                                                <TableRow key={row.label}>
                                                    <TableCell
                                                        sx={{
                                                            width: '120px',
                                                            fontWeight: 'bold',
                                                            pl: 0,
                                                        }}
                                                        align="left"
                                                    >
                                                        {row.label}
                                                    </TableCell>
                                                    <TableCell align="left">
                                                        {row.value || 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Box>
                            <Box
                                sx={{
                                    mt: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                }}
                            >
                                <Chip
                                    component="a"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={playerURL}
                                    label="mlb.com"
                                    color="info"
                                    icon={
                                        <HiExternalLink
                                            style={{ verticalAlign: 'middle' }}
                                        />
                                    }
                                    sx={{
                                        flexDirection: 'row-reverse',
                                        '& .MuiChip-icon': {
                                            margin: 0,
                                            marginLeft: '4px',
                                            marginRight: '10px',
                                            fontSize: '1.2rem',
                                        },
                                        '& .MuiChip-label': {
                                            paddingRight: '0px',
                                        },
                                    }}
                                    clickable
                                ></Chip>
                                <Chip
                                    component="a"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={storyURL}
                                    label="Story"
                                    color="info"
                                    icon={
                                        <HiExternalLink
                                            style={{ verticalAlign: 'middle' }}
                                        />
                                    }
                                    sx={{
                                        flexDirection: 'row-reverse',
                                        '& .MuiChip-icon': {
                                            margin: 0,
                                            marginLeft: '4px',
                                            marginRight: '10px',
                                            fontSize: '1.2rem',
                                        },
                                        '& .MuiChip-label': {
                                            paddingRight: '0px',
                                        },
                                    }}
                                    clickable
                                ></Chip>
                            </Box>
                        </Stack>
                    </Box>
                    <Box
                        sx={{
                            mt: 2,
                            height: '30px',
                            backgroundColor: selectedTeam
                                ? Consts.teamInfo[selectedTeam].colors.primary
                                : '',
                        }}
                    ></Box>
                    <Box
                        sx={{
                            height: '20px',
                            backgroundColor: selectedTeam
                                ? Consts.teamInfo[selectedTeam].colors.secondary
                                : '',
                        }}
                    ></Box>
                    <Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    onChange={allYearsToggle}
                                    checked={allYearsChecked}
                                />
                            }
                            label="All years"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    onChange={groupTeamsToggle}
                                    checked={groupTeamsChecked}
                                />
                            }
                            label="Group teams"
                        />
                    </Box>
                    {playerInfo?.primaryPosition?.name === 'Pitcher' &&
                        pitcherStats && (
                            <PitcherStatsView
                                pitcherStats={pitcherStats}
                                displayedPitcherStats={displayedPitcherStats}
                                pitcherStatsColumns={pitcherStatsColumns}
                                handlePitcherRowSelect={handlePitcherRowSelect}
                                handlePitcherRowDeselect={
                                    handlePitcherRowDeselect
                                }
                                pitcherYearDetails={pitcherYearDetails}
                                totalPitches={totalPitches}
                                allSeasonPitches={allSeasonPitches}
                                seasonInningsPitched={seasonInningsPitched}
                                pitcherGameLogColumns={pitcherGameLogColumns}
                                handlePitcherGameRowSelect={
                                    handlePitcherGameRowSelect
                                }
                                handlePitcherGameRowDeselect={
                                    handlePitcherGameRowDeselect
                                }
                                selectedPitcherGamePitches={
                                    selectedPitcherGamePitches
                                }
                                selectedPitcherGamePitchesVelocity={
                                    selectedPitcherGamePitchesVelocity
                                }
                            />
                        )}
                    {playerInfo?.primaryPosition?.name !== 'Pitcher' &&
                        hitterStats && (
                            <HitterStatsView
                                hitterStats={hitterStats}
                                displayedHitterStats={displayedHitterStats}
                                hitterStatsColumns={hitterStatsColumns}
                            />
                        )}
                    {awards && <Awards awards={awards} theme={theme} />}
                    {/* <div id="missing-stats-container">
                    <Typography variant="h5" noWrap component="div" sx={{ mt: 5 }}>
                        No stats
                    </Typography>
                </div> */}
                </Box>
            )}
        </>
    );
};
