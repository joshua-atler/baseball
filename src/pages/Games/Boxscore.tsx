import { Box, Chip, Divider, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { HiExternalLink } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';

import { PlayerPhoto } from '../../components/PlayerPhoto.tsx';
import { TeamLogo } from '../../components/TeamLogo.tsx';
import { useBasedash } from '../../context/BasedashContext.tsx';
import { fetchGame } from '../../services/gamesService.ts';
import { fetchPlayer } from '../../services/playerService.ts';
import { fetchStandings } from '../../services/standingsService.ts';
import { StandingsForBoxscore } from '../../types/standings.ts';
import { transformStandingsForBoxscore } from '../../utils/standingsTransformers.ts';

const cleanBroadcastName = (name) => {
    return name.split(/\s+presented\s+by\s+/i)[0].trim();
};

function LinescoreRow({ currGame, team, theme }) {
    const currentInning = currGame?.liveData?.linescore?.currentInning;
    const currentTeam = currGame?.liveData?.linescore?.isTopInning ? 'away' : 'home';

    return <tr>
        <td style={{ borderRight: '1px solid white' }}>{currGame && <TeamLogo teamAbbr={currGame?.gameData?.teams?.[team]?.abbreviation} size={30} />}{currGame?.gameData?.teams?.[team]?.abbreviation ?? team.charAt(0).toUpperCase() + team.slice(1)}</td>

        {currGame?.liveData?.linescore?.innings?.map((inning, i) => {
            const highlight = currentInning === inning.num && currentTeam === team && currGame?.gameData?.status?.detailedState !== 'Final';
            return <td key={i} style={{
                backgroundColor: highlight ? theme.palette.custom.highlightBlue : undefined,
                borderRadius: highlight ? '50%' : undefined
            }} >{inning?.[team].runs ?? '-'}</td>
        })}
        {Array.from({ length: Math.max(0, 9 - (currGame?.liveData?.linescore?.innings?.length || 0)) }).map((_, i) => (
            <td key={`empty-${i}`}>-</td>
        ))}

        {currGame &&
            <>
                <td style={{ borderLeft: '1px solid white' }}>{currGame?.liveData?.linescore?.teams?.[team]?.runs ?? '-'}</td>
                <td>{currGame?.liveData?.linescore?.teams?.[team]?.hits ?? '-'}</td>
                <td>{currGame?.liveData?.linescore?.teams?.[team]?.errors ?? '-'}</td>
            </>
        }
        {!currGame && Array.from({ length: 3 }).map((_, i) => {
            return <td key={i} style={i === 0 ? { borderLeft: '1px solid white' } : undefined}>-</td>
        })}
    </tr>
}

function ProbablePitcher({ pitcher }) {

    const pitcherStats = pitcher?.people?.[0]?.stats;
    const seasonStats = pitcherStats?.find(x => x.type.displayName === 'season')?.splits?.[0]?.stat;

    const stats = [
        { label: 'W-L', description: 'Wins-Losses', value: seasonStats?.wins ? `${seasonStats?.wins}-${seasonStats?.losses}` : '---' },
        { label: 'ERA', description: 'Earned run average', value: seasonStats?.era ?? '---' },
        { label: 'WHIP', description: 'Walks plus hits per inning pitched', value: seasonStats?.whip ?? '---' },
        { label: 'IP', description: 'Innings pitched', value: seasonStats?.inningsPitched ?? '---' },
        { label: 'K/9', description: 'Strikeouts per 9 innings', value: seasonStats?.strikeoutsPer9Inn ?? '---' },
        { label: 'BB/9', description: 'Walks per 9 innings', value: seasonStats?.walksPer9Inn ?? '---' },
    ];

    return <Stack spacing={2}>
        <PlayerPhoto playerID={pitcher?.people?.[0]?.id} width={150} height={150} />
        <Typography>
            <Link to={`/players/${pitcher?.people?.[0]?.id}`}>{pitcher?.people?.[0]?.fullName}</Link>
            {` (${pitcher?.people?.[0]?.pitchHand?.code})`}
        </Typography>
        <Grid container spacing={2}
        >
            {stats.map((stat, i) => (
                <Grid key={i} size={4}>
                    <Typography>
                        <span className="tooltip" data-tooltip={stat.description}>{stat.label}</span>{`: ${stat.value}`}
                    </Typography>
                </Grid>
            ))}
        </Grid>
    </Stack>
}

export default function Boxscore({ highlightedPlayer, setSelectedPlayer }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { selectedGame, selectedGameMetadata, timeZone } = useBasedash();

    const [currGame, setCurrGame] = useState(null);
    const [probablePitchers, setProbablePitchers] = useState(null);
    const [teamRecords, setTeamRecords] = useState<StandingsForBoxscore | null>(null);
    const [selectedSide, setSelectedSide] = useState('away');
    const displayValue = currGame ? selectedSide : null;

    async function fetchProbablePitchers() {
        const awayPitcherID = currGame?.gameData?.probablePitchers?.away?.id ?? null;
        const homePitcherID = currGame?.gameData?.probablePitchers?.home?.id ?? null;
        setProbablePitchers(await Promise.all([
            awayPitcherID === null ? null : fetchPlayer(awayPitcherID, ['pitching'], ['season']),
            homePitcherID === null ? null : fetchPlayer(homePitcherID, ['pitching'], ['season'])
        ]));
    }

    async function fetchTeamRecords() {
        const standings = await fetchStandings(month, day, year, 'regular season', 'division');

        if (standings.records.length === 0) {
            setTeamRecords(null);
            return;
        }

        setTeamRecords(transformStandingsForBoxscore(standings, awayTeamID, homeTeamID));
    }

    const [awayPitcher, homePitcher] = probablePitchers ?? [null, null];
    const [awayRecord, homeRecord] = teamRecords ?? [null, null];

    const awayTeamName = currGame?.gameData?.teams?.away?.teamName.toLowerCase().replace(' ', '-');
    const homeTeamName = currGame?.gameData?.teams?.home?.teamName.toLowerCase().replace(' ', '-');
    const awayTeamID = currGame?.gameData?.teams?.away?.id;
    const homeTeamID = currGame?.gameData?.teams?.home?.id;
    const gameDate = currGame?.gameData?.datetime?.officialDate;
    const [year, month, day] = gameDate?.split('-') || [];

    const gamedayUrl = `https://www.mlb.com/gameday/${awayTeamName}-vs-${homeTeamName}/${year}/${month}/${day}/${selectedGame}/final/box`;

    const abstractGameState = currGame?.gameData?.status?.abstractGameState;
    const detailedState = currGame?.gameData?.status?.detailedState;
    const linescore = currGame?.liveData?.linescore;
    const boxscore = currGame?.liveData?.boxscore;
    const currentBatterID = linescore?.offense?.batter?.id;

    let numInnings = 9;
    if (currGame) {

        if (abstractGameState === 'Preview') {
            numInnings = 9;
        } else if (abstractGameState === 'Live') {
            numInnings = linescore.innings.length;
            if (linescore.innings.length > 9) {
                numInnings = linescore.innings.length;
            } else {
                numInnings = 9;
            }
        } else if (detailedState !== 'Final') {
            numInnings = 9;
        } else {
            numInnings = linescore.innings.length;
        }
    } else {
        numInnings = 9;
    }

    const teamStats = {};
    teamStats.away = boxscore?.teams?.away?.teamStats;
    teamStats.home = boxscore?.teams?.home?.teamStats;



    useEffect(() => {
        if (currGame) {
            (async () => {
                fetchProbablePitchers();
                fetchTeamRecords();
            })();
        } else {
            setProbablePitchers(null);
            setTeamRecords(null);
        }
    }, [currGame]);


    useEffect(() => {
        if (selectedGame) {
            (async () => {
                setCurrGame(await fetchGame(selectedGame));
            })();
        } else {
            setCurrGame(null);
        }
    }, [selectedGame]);

    return (
        <>
            {<Box sx={{ height: 40, display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                {currGame &&
                    <>
                        <Typography sx={{ fontSize: 'inherit', verticalAlign: 'middle' }}>{currGame ?
                            <>
                                {`${currGame?.gameData?.datetime?.officialDate} ${currGame?.gameData?.datetime?.time} ${currGame?.gameData?.datetime?.ampm}`}
                            </> : ''}</Typography>
                        <Chip
                            component="a"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://www.mlb.com/stories/game/${selectedGame}`}
                            label="Recap"
                            color="info"
                            icon={<HiExternalLink style={{ verticalAlign: 'middle' }} />}
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
                                }
                            }}
                            clickable
                        >
                        </Chip>
                        <Chip
                            component="a"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={gamedayUrl}
                            label="mlb.com"
                            color="info"
                            icon={<HiExternalLink style={{ verticalAlign: 'middle' }} />}
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
                                }
                            }}
                            clickable
                        >
                        </Chip>
                    </>
                }
            </Box>}
            <Box sx={{ height: 40, display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                {currGame && <>
                    {selectedGameMetadata?.tickets && (
                        <Chip
                            component="a"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={selectedGameMetadata.tickets}
                            label="Tickets"
                            color="success"
                            icon={<HiExternalLink style={{ verticalAlign: 'middle' }} />}
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
                                }
                            }}
                            clickable
                        >
                        </Chip>
                    )}
                    {selectedGameMetadata?.seriesStatus && (
                        <Chip
                            target="_blank"
                            label={`Game ${selectedGameMetadata.seriesStatus.gameNumber}/${selectedGameMetadata.seriesStatus.totalGames}${selectedGameMetadata.seriesStatus.result ? ` - ${selectedGameMetadata.seriesStatus.result}` : ''}`}
                            color="warning"
                            variant="outlined"
                        >
                        </Chip>
                    )}
                    <Stack direction="row" spacing={1}>
                        {[...new Set(selectedGameMetadata?.broadcasts)].map((b) => {
                            return <Chip
                                key={b}
                                label={cleanBroadcastName(b)}
                                color="info"
                                variant="outlined"
                            />
                        })}
                    </Stack>
                </>}
            </Box>
            <table id="linescore">
                <thead>
                    <tr>
                        <th style={{ borderRight: '1px solid white' }}>Team</th>
                        {Array.from({ length: numInnings }).map((_, i) => {
                            const inningNum = i + 1;
                            return <th key={inningNum}>{inningNum}</th>
                        })}
                        <th style={{ borderLeft: '1px solid white' }}>R</th>
                        <th>H</th>
                        <th>E</th>
                    </tr>
                </thead>
                <tbody>
                    <LinescoreRow currGame={currGame} team='away' theme={theme} />
                    <LinescoreRow currGame={currGame} team='home' theme={theme} />
                </tbody>
            </table>
            <table id="pitching" style={{ tableLayout: 'fixed' }}>
                <thead>
                    <tr>
                        <th>Win</th>
                        <th>Loss</th>
                        <th>Save</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{currGame?.liveData?.decisions?.winner?.fullName ?
                            <Tooltip title={<PlayerPhoto playerID={currGame?.liveData?.decisions?.winner?.id} width={150} height={150} />}>
                                <Link to='/players/?'>{currGame?.liveData?.decisions?.winner?.fullName}</Link>
                            </Tooltip>
                            : '-'}
                        </td>
                        <td>{currGame?.liveData?.decisions?.loser?.fullName ?
                            <Tooltip title={<PlayerPhoto playerID={currGame?.liveData?.decisions?.loser?.id} width={150} height={150} />}>
                                <Link to='/players/?'>{currGame?.liveData?.decisions?.loser?.fullName}</Link>
                            </Tooltip>
                            : '-'}
                        </td>
                        <td>{currGame?.liveData?.decisions?.save?.fullName ?
                            <Tooltip title={<PlayerPhoto playerID={currGame?.liveData?.decisions?.save?.id} width={150} height={150} />}>
                                <Link to='/players/?'>{currGame?.liveData?.decisions?.save?.fullName}</Link>
                            </Tooltip>
                            : '-'}
                        </td>
                    </tr>
                </tbody>
            </table>
            <table id="boxscore">
                <colgroup>
                    {Array.from({ length: 12 }).map((_, i) => {
                        return <col key={i} />
                    })}
                </colgroup>
                <thead>
                    <tr>
                        <th colSpan={12}>
                            <ToggleButtonGroup
                                color="primary"
                                value={displayValue}
                                exclusive
                                onChange={(e, nextView) => {
                                    if (!nextView) return;
                                    setSelectedSide(nextView)
                                }}
                                sx={{
                                    gap: 4,
                                    width: '100%',
                                    borderRadius: '50px',
                                    '& .MuiToggleButton-root': {
                                        borderRadius: 'inherit'
                                    },
                                }}
                                disabled={!currGame}
                            >
                                <ToggleButton size="large" value="away"
                                    sx={{
                                        width: '50%',
                                        '&.Mui-selected': {
                                            color: theme.palette.custom.white,
                                            borderColor: theme.palette.custom.lightGray,
                                            fontWeight: 'bold'
                                        }
                                    }}>{currGame ?
                                        <>
                                            <TeamLogo teamAbbr={currGame?.gameData?.teams?.away?.abbreviation} size={30} />
                                            {currGame?.gameData?.teams?.away?.teamName}
                                            {awayRecord && ` (${awayRecord})`}
                                        </>
                                        :
                                        'Away'
                                    }
                                </ToggleButton>
                                <ToggleButton size="large" value="home"
                                    sx={{
                                        width: '50%',
                                        '&.Mui-selected': {
                                            color: theme.palette.custom.white,
                                            borderColor: theme.palette.custom.lightGray,
                                            fontWeight: 'bold'
                                        }
                                    }}>
                                    {currGame ?
                                        <>
                                            <TeamLogo teamAbbr={currGame?.gameData?.teams?.home?.abbreviation} size={30} />
                                            {currGame?.gameData?.teams?.home?.teamName}
                                            {homeRecord && ` (${homeRecord})`}
                                        </>
                                        :
                                        'Home'
                                    }</ToggleButton>
                            </ToggleButtonGroup>
                        </th>
                    </tr>
                    <tr>
                        <th colSpan={3}>Batter</th>
                        <th><span className="tooltip" data-tooltip="At bats">AB</span></th>
                        <th><span className="tooltip" data-tooltip="Runs">R</span></th>
                        <th><span className="tooltip" data-tooltip="Hits">H</span></th>
                        <th><span className="tooltip" data-tooltip="Walks">BB</span></th>
                        <th><span className="tooltip" data-tooltip="Runs batted in">RBI</span></th>
                        <th><span className="tooltip" data-tooltip="Home runs">HR</span></th>
                        <th><span className="tooltip" data-tooltip="Strikeouts">K</span></th>
                        <th><span className="tooltip" data-tooltip="Batting average">AVG</span></th>
                        <th><span className="tooltip" data-tooltip="On-base plus slugging">OPS</span></th>
                    </tr>
                </thead>
                <tbody>
                    {boxscore?.teams?.[selectedSide]?.batters.filter(batterID => {
                        const pitchers = boxscore?.teams?.[selectedSide]?.pitchers;
                        return !pitchers.includes(batterID);
                    }).map((batterID, i) => {
                        const batter = boxscore?.teams?.[selectedSide]?.players?.[`ID${batterID}`];
                        const isSub = batter?.battingOrder % 100 !== 0;
                        const fullName = batter?.person?.fullName;
                        const jerseyNumber = batter?.jerseyNumber;
                        const position = batter?.position?.abbreviation;
                        const gameStats = batter?.stats?.batting;
                        const seasonStats = batter?.seasonStats?.batting;
                        return <tr key={batterID} style={{ backgroundColor: (currentBatterID === batterID && detailedState !== 'Final') ? theme.palette.custom.highlightBlue : '' }}>
                            <td>{isSub && `\u2937 ${batter?.stats?.batting?.note ? `${batter?.stats?.batting?.note[0]} -` : ''}\u00A0`}

                                <Tooltip title={<PlayerPhoto playerID={batter?.person?.id} width={150} height={150} />}>
                                    <Link to='/players/?'>{fullName}</Link>
                                </Tooltip>
                            </td>
                            <td>#{jerseyNumber}</td>
                            <td>{position}</td>
                            <td>{gameStats?.atBats}</td>
                            <td>{gameStats?.runs}</td>
                            <td>{gameStats?.hits}</td>
                            <td>{gameStats?.baseOnBalls}</td>
                            <td>{gameStats?.rbi}</td>
                            <td>{gameStats?.homeRuns}</td>
                            <td>{gameStats?.strikeOuts}</td>
                            <td>{seasonStats?.avg}</td>
                            <td>{seasonStats?.ops}</td>
                        </tr>
                    })}
                </tbody>
                {(currGame && detailedState !== 'Scheduled') &&
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', borderTop: '1px solid white' }}>
                            <td>Totals</td><td></td><td></td>
                            <td>{teamStats?.[selectedSide].batting?.atBats}</td>
                            <td>{teamStats?.[selectedSide].batting?.runs}</td>
                            <td>{teamStats?.[selectedSide].batting?.hits}</td>
                            <td>{teamStats?.[selectedSide].batting?.baseOnBalls}</td>
                            <td>{teamStats?.[selectedSide].batting?.rbi}</td>
                            <td>{teamStats?.[selectedSide].batting?.homeRuns}</td>
                            <td>{teamStats?.[selectedSide].batting?.strikeOuts}</td>
                            <td></td><td></td>
                        </tr>
                    </tfoot>
                }
            </table>
            <Box sx={{ width: '600px', paddingX: 2, mb: 2 }}>
                <Stack>
                    {
                        boxscore?.teams?.[selectedSide].note.map((sub, i) => {
                            return <Typography key={i} sx={{ fontSize: 14 }}>
                                {sub.label} - {sub.value}
                            </Typography>
                        })
                    }
                </Stack>
            </Box>
            <Box sx={{ width: '600px', paddingX: 2, mb: 2 }}>
                {
                    boxscore?.teams?.[selectedSide].info.map((info, i) => {
                        return <Box key={i} sx={{ mb: 2 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>{info.title}</Typography>
                            <Stack>
                                {info.fieldList.map((event, j) => {
                                    return <Typography key={j} sx={{ fontSize: 14 }}>
                                        <b>{event.label}</b>: {event.value}
                                    </Typography>
                                })}
                            </Stack>
                        </Box>
                    })
                }
            </Box>
            <table id="pitchers">
                <colgroup>
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                </colgroup>
                <thead>
                    <tr>
                        <th colSpan={2}>Pitcher</th>
                        <th><span className="tooltip" data-tooltip="Innings pitched">IP</span></th>
                        <th><span className="tooltip" data-tooltip="Hits">H</span></th>
                        <th><span className="tooltip" data-tooltip="Runs">R</span></th>
                        <th><span className="tooltip" data-tooltip="Earned runs">ER</span></th>
                        <th><span className="tooltip" data-tooltip="Walks">BB</span></th>
                        <th><span className="tooltip" data-tooltip="Strikeouts">K</span></th>
                        <th><span className="tooltip" data-tooltip="Home runs">HR</span></th>
                        <th><span className="tooltip" data-tooltip="Earned run average">ERA</span></th>
                    </tr>
                </thead>
                <tbody>
                    {boxscore?.teams?.[selectedSide]?.pitchers.map((pitcherID, i) => {
                        const pitcher = boxscore?.teams?.[selectedSide]?.players?.[`ID${pitcherID}`];
                        const fullName = pitcher?.person?.fullName;
                        const jerseyNumber = pitcher?.jerseyNumber;
                        const gameStats = pitcher?.stats?.pitching;
                        const seasonStats = pitcher?.seasonStats?.pitching;
                        return <tr key={pitcherID}>
                            <td>
                                <Tooltip title={<PlayerPhoto playerID={pitcher?.person?.id} width={150} height={150} />}>
                                    <Link to='/players/?'>{fullName}</Link>
                                </Tooltip>
                            </td>
                            <td>#{jerseyNumber}</td>
                            <td>{gameStats.inningsPitched}</td>
                            <td>{gameStats.hits}</td>
                            <td>{gameStats.runs}</td>
                            <td>{gameStats.earnedRuns}</td>
                            <td>{gameStats.baseOnBalls}</td>
                            <td>{gameStats.strikeOuts}</td>
                            <td>{gameStats.homeRuns}</td>
                            <td>{seasonStats.era}</td>
                        </tr>
                    })}
                </tbody>
                {(currGame && detailedState !== 'Scheduled') &&
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', borderTop: '1px solid white' }}>
                            <td>Totals</td><td></td>
                            <td>{teamStats?.[selectedSide].pitching?.inningsPitched}</td>
                            <td>{teamStats?.[selectedSide].pitching?.hits}</td>
                            <td>{teamStats?.[selectedSide].pitching?.runs}</td>
                            <td>{teamStats?.[selectedSide].pitching?.earnedRuns}</td>
                            <td>{teamStats?.[selectedSide].pitching?.baseOnBalls}</td>
                            <td>{teamStats?.[selectedSide].pitching?.strikeOuts}</td>
                            <td>{teamStats?.[selectedSide].pitching?.homeRuns}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                }
            </table>

            {(currGame && ['Pre-Game', 'Scheduled'].includes(detailedState)) &&
                <>
                    <Box sx={{ width: '600px', paddingX: 2, mt: 2, mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>PROBABLE PITCHERS</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Box sx={{ width: '275px' }}>
                                {awayPitcher ?
                                    <ProbablePitcher pitcher={awayPitcher} />
                                    : 'TBA'
                                }
                            </Box>
                            <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'white' }} />
                            <Box sx={{ width: '275px' }}>
                                {homePitcher ?
                                    <ProbablePitcher pitcher={homePitcher} />
                                    : 'TBA'
                                }
                            </Box>
                        </Box>
                    </Box>
                </>}
            <Box sx={{ width: '600px', paddingX: 2, mb: 2 }}>
                {currGame && <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>GAME NOTES</Typography>}
                {currGame?.liveData?.boxscore?.info?.map((detail, i) => {
                    return <Typography key={i} sx={{ fontSize: 14 }}>
                        <b>{detail?.label}</b>{detail?.value && ': '}{detail?.value}
                    </Typography>
                })
                }
            </Box>
        </>
    )
}