// @ts-nocheck

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { HiCheck, HiX, HiExternalLink } from 'react-icons/hi';

import {
    Box,
    Typography,
    Chip,
    Stack,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Switch,
    FormControlLabel,
    Modal,
    Button,
    Table,
    TableBody,
    TableRow,
    TableCell
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
DataTable.use(DT);

import { useBasedash } from '../../context/BasedashContext';

import $ from 'jquery';
import 'datatables.net-dt';
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
import Chart from 'chart.js/auto';

import { Consts } from '../../consts/consts.ts';
import '../../styles/style.css';
import '../../styles/dtStyle.css';
import '../../styles/slimSelectStyle.css';
import '../../styles/cssToggleSwitchStyle.css';
import { fetchPlayer, fetchAwards } from '../../services/playerService.ts';
import { transformAwards, transformPitcherPitchArsenal, transformPitcherPitchLog, transformPitcherPitchSpeeds, transformPitcherStats, transformPitcherGameLog } from '../../utils/playerTransformers.ts';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, Legend, CartesianGrid, XAxis, YAxis, ScatterChart, Scatter } from 'recharts';
import { LoadingCircle } from '../../components/LoadingCircle.tsx';
import { fetchGame } from '../../services/gamesService.ts';
import PitchSpeedsChart from '../../charts/PitchSpeedsChart.tsx';
import PitchArsenalChart from '../../charts/PitchArsenalChart.tsx';
import AllSeasonPitchesChart from '../../charts/AllSeasonPitchesChart.tsx';
import GamePitchesChart from '../../charts/GamePitchesChart.tsx';
import InningsPitchedChart from '../../charts/InningsPitchedChart.tsx';
import GamePitchesVelocityChart from '../../charts/GamePitchesVelocityChart.tsx';


function AwardCard({ award, teams, dates }) {
    return (
        <Card>
            <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                    {award}
                </Typography>
                {teams.map((team, index) => (
                    <Box key={index} display="flex" gap={2} justifyContent="space-between">
                        <Typography variant="body1">{team}</Typography>
                        <Typography variant="body1">{dates[index]}</Typography>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
}

function Awards({ awards, theme }) {
    return (
        <Accordion sx={{
            bgcolor: theme.palette.custom.lightGray
        }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
            >
                <h2>Awards ({awards.length})</h2>
            </AccordionSummary>
            <AccordionDetails>
                <Box display='flex' flexWrap='wrap' gap={2}>
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
}

const PITCH_COLORS = {
    'Fastball': 'rgb(55, 160, 235)',
    'Four-seam FB': 'rgb(55, 160, 235)',
    'Four-Seam Fastball': 'rgb(55, 160, 235)',
    'Cutter': 'rgb(255, 100, 130)',
    'Splitter': 'rgb(75, 200, 200)',
    'Sinker': 'rgb(255, 160, 60)',
    'Sweeper': 'rgb(50, 100, 150)',
    'Slider': 'rgb(100, 200, 50)',
    'Curveball': 'rgb(255, 200, 85)',
    'Knuckle Curve': 'rgb(85, 255, 200)',
    'Changeup': 'rgb(100, 50, 255)',
};

export default function PlayerStats({ }) {
    const theme = useTheme();
    const {
        selectedPlayer,
        setSelectedPlayer,
        selectedTeam,
        setSelectedGame,
        setSelectedGameMetadata
    } = useBasedash();

    const pitcherStatsColumns = [
        { data: 'year', title: 'Year', className: 'dt-right' },
        {
            data: 'team', title: 'Team', render: (data) => {
                if (data.length > 0) {
                    const logoURL = Consts.teamInfo[data].logo;
                    return `<img src=${logoURL} style="width: 40px; height: 40px" />`
                } else {
                    return '';
                }
            }
        },
        { data: 'stats.wins', title: 'W' },
        { data: 'stats.losses', title: 'L' },
        { data: 'stats.era', title: 'ERA' },
        { data: 'stats.gamesPlayed', title: 'G' },
        { data: 'stats.gamesStarted', title: 'GS' },
        { data: 'stats.saves', title: 'S' },
        { data: 'stats.inningsPitched', title: 'IP' },
        { data: 'stats.strikeOuts', title: 'K' },
        { data: 'stats.whip', title: 'WHIP', },
    ];

    const pitcherGameLogColumns = [
        { data: 'gamePk', title: '', visible: false },
        { data: 'date', title: 'Date', className: 'dt-right' },
        {
            data: 'matchup', title: 'Matchup', render: (data) => {
                const awayLogoURL = Consts.teamInfo[data[0]].logo;
                const homeLogoURL = Consts.teamInfo[data[1]].logo;
                return `<span style="display: inline-flex; align-items: center"><img src=${awayLogoURL} style="width: 40px; height: 40px" />
                <span style="margin: 0 10px; font-weight: 500;">@</span>
                <img src=${homeLogoURL} style="width: 40px; height: 40px" /></span>`;
            }
        },
        {
            data: 'isWin', title: 'Win/Loss', render: (data) => {
                const badgeStyle = `
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    font-size: 0.9rem;
                    font-weight: bold;
                    vertical-align: middle;
                `;
                if (data) {
                    return `
                        <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background-color: #e8f5e9; border: 1px solid #a5d6a7; vertical-align: middle;">
                        ${renderToString(<HiCheck style={{ color: '#2e7d32', fontSize: '1.1rem' }} />)}
                        </span>
                    `
                } else {
                    return `
                        <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background-color: #ffebee; border: 1px solid #ef9a9a; vertical-align: middle;">
                        ${renderToString(<HiX style={{ color: '#c62828', fontSize: '1.1rem' }} />)}
                    </span>
                    `
                };
            }
        },
        { data: 'pitches', title: 'Pitches' },
        { data: 'inningsPitched', title: 'IP' },
        { data: 'earnedRuns', title: 'ER' },
        { data: 'earnedRunAverage', title: 'ERA' },
        { data: 'hits', title: 'H' },
        { data: 'runs', title: 'R' },
        { data: 'strikeouts', title: 'K' },
        { data: 'walks', title: 'BB' },
        { data: 'whip', title: 'WHIP' },
        {
            title: 'Actions',
            data: null,
            className: 'dt-center',
            render: (data, type, row) => {
                return `
                <button
                    onclick="event.stopPropagation(); handleViewGameClick(${row.gamePk})"
                    style="padding: 5px 10px; background-color: ${theme.palette.custom.highlightGreen}; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px;">
                    View Game
                    ${renderToString(<HiExternalLink style={{ verticalAlign: 'middle' }} size={20} />)}
                </button>
            `;
            }
        }
    ];


    const navigate = useNavigate();
    const awardsContainerRef = useRef(null);
    const awardsRef = useRef(null);
    const [playerPosition, setPlayerPosition] = useState('');

    const [seasonPitchingForAllYears, setSeasonPitchingForAllYears] = useState([]);
    const [seasonPitching, setSeasonPitching] = useState({});
    const [careerPitching, setCareerPitching] = useState({});

    const [seasonHittingForAllYears, setSeasonHittingForAllYears] = useState([]);
    const [seasonHitting, setSeasonHitting] = useState({});
    const [careerHitting, setCareerHitting] = useState({});

    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState({});

    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => {
        setModalOpen(false);
        setModalData({});
    }

    var pitchingStatsDT;
    var pitchingGameLogDT;

    var hittingStatsDT;
    var hittingGameLogDT;

    var playerID = null;
    var playerStats = null;
    var teamColor = null;

    const svgUpArrow = '<svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#ffffff" style="position: absolute; left: 50px;" data-direction="up"><path d="m280-400 200-200 200 200H280Z"/></svg>';

    const svgDownArrow = '<svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#ffffff" style="position: absolute; left: 50px;" data-direction="down"><path d="M480-360 280-560h400L480-360Z"/></svg>';


    ///////////////////////////////////////////////////////////
    const fixName = (name) => {
        let cleanName = name.toLowerCase();
        cleanName = cleanName.replace(/ /g, "-");
        cleanName = cleanName.replace(/'/g, "-");
        let match = cleanName.match(/\./g);
        if (match && match.length == 2) {
            cleanName = cleanName.replace(/\./, '-');
        }
        cleanName = cleanName.replace(/\./g, "");
        cleanName = cleanName.normalize("NFD");
        cleanName = cleanName.replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n");

        return cleanName;
    }

    const [playerInfo, setPlayerInfo] = useState(null);
    const playerURL = playerInfo === null ? '' : `https://www.mlb.com/player/${fixName(playerInfo.fullName)}-${selectedPlayer}`;
    const storyURL = playerInfo === null ? '' : `https://www.mlb.com/stories/player/${selectedPlayer}?storylocal=player-page-header-embed`;
    const selectedTeamLogo = selectedTeam ? Consts.teamInfo[selectedTeam].logo : '';
    const [awards, setAwards] = useState([]);
    const [pitcherStats, setPitcherStats] = useState(null);
    const [pitcherYearDetails, setPitcherYearDetails] = useState({
        isLoading: false,
        year: null,
        pitchSpeeds: null,
        pitchArsenal: null,
        gameLog: null,
        playLog: null,
        pitchLog: null,
        error: false
    });
    const allSeasonPitches = useMemo(() => {
        const pitchLog = pitcherYearDetails?.pitchLog;
        if (!pitchLog) return null;

        return Object.values(pitchLog).flatMap(game =>
            Object.values(game).flat()
        );
    }, [pitcherYearDetails]);
    const [seasonInningsPitched, setSeasonInningsPitched] = useState([]);


    const [selectedPitcherGamePitches, setSelectedPitcherGamePitches] = useState(null);
    const [selectedPitcherGamePitchesVelocity, setSelectedPitcherGamePitchesVelocity] = useState(null);

    const firstYear = 2010;
    const [allYearsChecked, setAllYearsChecked] = useState(true);
    const [groupTeamsChecked, setGroupTeamsChecked] = useState(false);

    const totalPitches = pitcherYearDetails?.pitchArsenal?.map(pitch => pitch.count).reduce((acc, curr) => acc + curr, 0);

    const bioRows = (playerInfo === null) ? [] : [
        { label: 'Age', value: playerInfo.currentAge },
        { label: 'Position', value: playerInfo.primaryPosition.name },
        { label: 'Birthplace', value: `${playerInfo.birthCity}, ${playerInfo.birthCountry}` },
        { label: 'Height', value: playerInfo.height },
        { label: 'Weight', value: playerInfo.weight },
        { label: 'MLB Debut', value: playerInfo.mlbDebutDate },
        { label: 'Bat/Throw', value: `${playerInfo.batSide.code}/${playerInfo.pitchHand.code}` }
    ];

    const displayedPitcherStats = useMemo(() => {
        if (pitcherStats === null) return null;

        const multiTeamYears = new Set(
            pitcherStats.filter(row => (row.team === '' && row.year !== 'Career')).map(row => row.year)
        );

        const filteredYears = pitcherStats.filter(row => {
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
            return filteredYears.filter(row => row.year === Temporal.Now.plainDateISO().year.toString());
        }

    }, [pitcherStats, allYearsChecked, groupTeamsChecked]);

    const allYearsToggle = (event) => {
        setAllYearsChecked(event.target.checked);
    }

    const groupTeamsToggle = (event) => {
        setGroupTeamsChecked(event.target.checked);
    }

    useEffect(() => {
        async function loadInningsPitched() {
            const gamePromises = pitcherYearDetails.gameLog.map(async (gameInfo) => {
                const gameData = await fetchGame(gameInfo.gamePk);
                return gameData;
            })
            const allGames = await Promise.all(gamePromises);

            const masterOutsByInning = {};

            const gamesInningsPitched = allGames.map(game => {
                const pitcherOuts = game.liveData.plays.allPlays.filter(play => play.result.isOut && play.matchup.pitcher.id === playerInfo.id);
                pitcherOuts.forEach((play) => {
                    const inningNum = play.about.inning;

                    if (!masterOutsByInning[inningNum]) {
                        masterOutsByInning[inningNum] = 0;
                    }

                    masterOutsByInning[inningNum] += 1;
                });
            });
            setSeasonInningsPitched(Object.entries(masterOutsByInning).map(inning => {
                return {
                    inningNum: inning[0],
                    inningsPitched: Number(inning[1] / 3).toFixed(2)
                }
            }));
        }

        if (pitcherYearDetails.gameLog) {
            loadInningsPitched();
        } else {
            setSeasonInningsPitched([]);
        }

    }, [pitcherYearDetails.gameLog]);

    const handlePitcherRowSelect = (e, dt, type, indexes) => {

        const getPitcherYearDetails = async () => {

            const selectedYear = displayedPitcherStats[indexes].year;
            setPitcherYearDetails(prev => ({ ...prev, isLoading: true, error: null }));

            try {
                const rawPitcherYearDetails = await fetchPlayer(selectedPlayer, ['pitching'], ['pitchArsenal', 'gameLog', 'playLog', 'pitchLog', 'career'], selectedYear);

                const rawPitcherPitchArsenal = rawPitcherYearDetails.people[0].stats.filter(s => s.type.displayName === 'pitchArsenal')[0];
                const pitcherPitchArsenal = transformPitcherPitchArsenal(rawPitcherPitchArsenal);
                const pitcherPitchSpeeds = transformPitcherPitchSpeeds(rawPitcherPitchArsenal);

                const rawPitcherGameLog = rawPitcherYearDetails.people[0].stats.filter(s => s.type.displayName === 'gameLog')[0].splits;

                const pitchLog = await transformPitcherPitchLog(rawPitcherGameLog, selectedPlayer);

                const gameLog = await transformPitcherGameLog(rawPitcherGameLog);

                setPitcherYearDetails({
                    isLoading: false,
                    year: selectedYear,
                    pitchArsenal: pitcherPitchArsenal,
                    pitchSpeeds: pitcherPitchSpeeds,
                    gameLog: gameLog,
                    playLog: null,
                    pitchLog: pitchLog,
                    error: false
                });
            } catch (err) {
                console.error(err.message);
                setPitcherYearDetails(prev => ({ ...prev, isLoading: false, error: err.message }));
            }
        }

        getPitcherYearDetails();
    };

    const handlePitcherRowDeselect = (e, dt, type, indexes) => {
        setPitcherYearDetails({
            isLoading: false,
            year: null,
            pitchArsenal: null,
            pitchSpeeds: null,
            gameLog: null,
            playLog: null,
            pitchLog: null,
            error: false
        });
    };

    const handlePitcherGameRowSelect = (e, dt, type, indexes) => {
        const selectedPitcherGame = pitcherYearDetails.gameLog[indexes].gamePk;
        setSelectedPitcherGamePitches(Object.values(pitcherYearDetails.pitchLog[selectedPitcherGame]).flat());
        setSelectedPitcherGamePitchesVelocity(Object.values(pitcherYearDetails.pitchLog[selectedPitcherGame]).flat().map(pitch => {
            return {
                ...pitch,
                pitchTime: Date.parse(pitch.startTime),
                velocity: pitch.pitchData.startSpeed
            }
        }));
    };

    console.log('selectedPitcherGamePitchesVelocity');
    console.log(selectedPitcherGamePitchesVelocity);

    const handlePitcherGameRowDeselect = (e, dt, type, indexes) => {
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
            const matchedRow = pitcherYearDetails.gameLog.find(row => row.gamePk === gamePk);

            if (matchedRow) {
                setSelectedGame(gamePk);
                setSelectedGameMetadata({
                    tickets: matchedRow.gameMetadata?.tickets || null,
                    broadcasts: matchedRow.gameMetadata?.broadcasts || null,
                    seriesStatus: matchedRow.gameMetadata?.seriesStatus || null
                });
                navigate('/games');
            }
        };

        return () => {
            delete window.handleViewGameClick;
        };
    }, [pitcherYearDetails.gameLog, navigate]);

    useEffect(() => {
        const getPlayer = async () => {
            if (selectedPlayer === null) {
                setPlayerInfo(null);
                setAwards([]);
                setPitcherStats(null);
                return;
            }

            const rawPlayerInfo = await fetchPlayer(selectedPlayer);
            const playerInfo = rawPlayerInfo.people[0];
            setPlayerInfo(playerInfo);

            var statsURLs = [];

            const seasonPitchingStats = Array.from({ length: Temporal.Now.plainDateISO().year - firstYear + 1 }).map((_, i) => {
                const year = Temporal.Now.plainDateISO().year - i;
                return fetchPlayer(selectedPlayer, ['pitching'], ['season', 'seasonAdvanced'], year);
            });

            const careerPitchingStats = fetchPlayer(selectedPlayer, ['pitching'], ['career', 'careerAdvanced']);

            const rawPitcherStats = await Promise.all([...seasonPitchingStats, careerPitchingStats]);

            const pitcherStats = transformPitcherStats(rawPitcherStats);
            setPitcherStats(pitcherStats);

            const rawAwards = await fetchAwards(selectedPlayer);
            if (rawAwards.people[0].awards) {
                const awards = transformAwards(rawAwards);
                setAwards(awards);
            } else {
                setAwards(null);
            }
        }

        getPlayer();

        //                     console.log(gameLog[i]);
        //                     var date = gameLog[i]['date'];
        //                     var team = gameLog[i]['team']['name'];
        //                     var opponent = gameLog[i]['opponent']['name'];
        //                     var summary = gameLog[i]['stat']['summary'];
        //                     var atBats = gameLog[i]['stat']['atBats'];
        //                     var hits = gameLog[i]['stat']['hits'];
        //                     var homeRuns = gameLog[i]['stat']['homeRuns'];
        //                     var walks = gameLog[i]['stat']['baseOnBalls'];
        //                     var strikeouts = gameLog[i]['stat']['strikeOuts'];
        //                     var rbi = gameLog[i]['stat']['rbi'];
        //                     var totalBases = gameLog[i]['stat']['totalBases'];
        //                     var link = gameLog[i]['game']['link'];

        //                     hittingGameLogDT.row.add([
        //                         date,
        //                         matchup,
        //                         summary,
        //                         atBats,
        //                         hits,
        //                         homeRuns,
        //                         walks,
        //                         strikeouts,
        //                         rbi,
        //                         totalBases,
        //                         link
        //                     ]);

        //     function createGenericCharts(year) {
        //         fetch(`https://statsapi.mlb.com/api/v1/seasons/${year}?sportId=1`)
        //             .then(response => {
        //                 if (!response.ok) {
        //                     throw new Error('Network response was not ok');
        //                 }
        //                 return response.json();
        //             })
        //             .then(seasonInfo => {
        //                 var seasonEndDate = seasonInfo['seasons'][0]['regularSeasonEndDate'];
        //                 seasonEndDate = new Date(`${seasonEndDate}T00:00:00`);

        //                 fetch(`https://statsapi.mlb.com/api/v1/people/${playerID}?appContext=majorLeague&hydrate=team,currentTeam,rosterEntries`)
        //                     .then(response => {
        //                         if (!response.ok) {
        //                             throw new Error('Network response was not ok');
        //                         }
        //                         return response.json();
        //                     })
        //                     .then(playerInfo => {
        //                         fetch(`https://statsapi.mlb.com/api/v1/people/${playerID}?hydrate=stats(group=[hitting,pitching],type=[season,seasonAdvanced,gameLog],season=${year})`)
        //                             .then(response => {
        //                                 if (!response.ok) {
        //                                     throw new Error('Network response was not ok');
        //                                 }
        //                                 return response.json();
        //                             })
        //                             .then(allStats => {
        //                                 var seasonStatsByTeam = allStats['people'][0]['stats'][0]['splits'];
        //                                 // console.log('----------------------');
        //                                 console.log(seasonStatsByTeam);
        //                                 var allTeamsURLs = [];
        //                                 // for (let i = 0; i < seasonStatsByTeam.length; i++) {
        //                                 for (let i = 0; i < seasonStatsByTeam.length; i++) {
        //                                     if ('team' in seasonStatsByTeam[i]) {
        //                                         allTeamsURLs.push(`${Consts.baseURL}/teams/${seasonStatsByTeam[i]['team']['id']}`);
        //                                         // fetch(`${Consts.baseURL}/teams/${seasonStatsByTeam[i]['team']['id']}`)
        //                                         // .then(response => {
        //                                         //     if (!response.ok) {
        //                                         //         throw new Error('Network response was not ok');
        //                                         //     }
        //                                         //     return response.json();
        //                                         // })
        //                                         // .then(teamInfo => {
        //                                         //     console.log('team info');
        //                                         //     console.log(teamInfo);
        //                                         //     allTeams.push(teamInfo['teams'][0]['abbreviation']);
        //                                         // })
        //                                         // // allTeams.push(seasonStatsByTeam[i]['team']);
        //                                     }
        //                                 }

        //                                 var promises = allTeamsURLs.map(url =>
        //                                     fetch(url)
        //                                         .then(response => {
        //                                             return response.json();
        //                                         })
        //                                         .catch(error => console.error('Error fetching data:', error))
        //                                 );

        //                                 var allTeams = [];
        //                                 Promise.all(promises)
        //                                     .then(splitData => {
        //                                         var combinedData = splitData.flat();
        //                                         // console.log('combinedData');
        //                                         // console.log(combinedData);

        //                                         for (let i = 0; i < combinedData.length; i++) {
        //                                             allTeams.push({
        //                                                 id: combinedData[i]['teams'][0]['id'],
        //                                                 name: combinedData[i]['teams'][0]['name'],
        //                                                 abr: combinedData[i]['teams'][0]['abbreviation']
        //                                             });
        //                                         }

        //                                         // var teamId = playerInfo['people'][0]['currentTeam']['id'];
        //                                         // var teamName = playerInfo['people'][0]['currentTeam']['name'];

        //                                         // console.log(`${teamId}: ${teamName}`);

        //                                         var currDate;

        //                                         var dates = [];
        //                                         var rosterURLs = [];

        //                                         var dateOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
        //                                         for (let i = 0; i < allTeams.length; i++) {
        //                                             currDate = new Date(`${seasonInfo['seasons'][0]['regularSeasonStartDate']}T00:00:00`);
        //                                             while (currDate <= seasonEndDate) {
        //                                                 // console.log(currDate);

        //                                                 var formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(currDate);
        //                                                 // console.log(formattedDate);
        //                                                 dates.push(formattedDate);

        //                                                 rosterURLs.push(`https://statsapi.mlb.com/api/v1/teams/${allTeams[i]['id']}/roster?rosterType=active&season=${year}&date=${formattedDate}`);
        //                                                 var newDate = currDate.setDate(currDate.getDate() + 1);
        //                                                 currDate = new Date(newDate);
        //                                             }
        //                                         }
        //                                         // console.log(`rosterURLs.length: ${rosterURLs.length}`);

        //                                         var promises = rosterURLs.map(url =>
        //                                             fetch(url)
        //                                                 .then(response => {
        //                                                     return response.json();
        //                                                 })
        //                                                 .catch(error => console.error('Error fetching data:', error))
        //                                         );

        //                                         Promise.all(promises)
        //                                             .then(splitData => {
        //                                                 var combinedData = splitData.flat();

        //                                                 // var activeDates = [];
        //                                                 // var inactiveDates = [];
        //                                                 var activeDates = {};
        //                                                 var inactiveDates = {};

        //                                                 // console.log(`combinedData.length: ${combinedData.length}`);
        //                                                 var seasonLength = combinedData.length / allTeams.length;
        //                                                 // console.log(`seasonLength: ${seasonLength}`);

        //                                                 // console.log('all teams!');
        //                                                 // console.log(allTeams);
        //                                                 for (let i = 0; i < allTeams.length; i++) {
        //                                                     // console.log(`++ ${allTeams[i]}`);
        //                                                     var lastStatus = '';
        //                                                     var currStatus = '';
        //                                                     var sessionStart = dates[0];
        //                                                     var sessionEnd;

        //                                                     activeDates[allTeams[i]['abr']] = [];
        //                                                     inactiveDates[allTeams[i]['abr']] = [];

        //                                                     // console.log(activeDates);

        //                                                     // for (let j = 0; j < combinedData.length; j++) {
        //                                                     for (let j = 0; j < seasonLength; j++) {
        //                                                         // console.log(seasonLength * i + j);
        //                                                         // console.log(combinedData[seasonLength * i + j]['roster']);

        //                                                         var roster = combinedData[seasonLength * i + j]['roster'];
        //                                                         // console.log(roster);

        //                                                         const playerOnRoster = roster.find(rosterEntry => rosterEntry.person.id == playerID);
        //                                                         if (playerOnRoster) {
        //                                                             // console.log(`${dates[i]}: ${playerOnRoster}`);
        //                                                             // console.log(`${dates[i]}: active`);
        //                                                             // console.log(playerOnRoster);
        //                                                             currStatus = 'active';
        //                                                         } else {
        //                                                             // console.log(`${dates[i]}: not found`);
        //                                                             currStatus = 'inactive';
        //                                                         }

        //                                                         // if (currStatus != lastStatus || j == combinedData.length - 1) {
        //                                                         if (currStatus != lastStatus || j == seasonLength - 1) {
        //                                                             if (j != 0) {
        //                                                                 // sessionEnd = dates[i - 1];
        //                                                                 sessionEnd = dates[j];
        //                                                                 if (lastStatus == 'active') {
        //                                                                     activeDates[allTeams[i]['abr']].push([new Date(sessionStart), new Date(sessionEnd)]);
        //                                                                 } else if (lastStatus == 'inactive') {
        //                                                                     inactiveDates[allTeams[i]['abr']].push([new Date(sessionStart), new Date(sessionEnd)]);
        //                                                                 }
        //                                                             }

        //                                                             lastStatus = currStatus;
        //                                                             sessionStart = dates[j];
        //                                                         }
        //                                                     }
        //                                                 }

        //                                                 console.log(`year: ${year}`);
        //                                                 fetch(`https://statsapi.mlb.com/api/v1/people/${playerID}?hydrate=stats(group=[hitting,pitching],type=[season,seasonAdvanced,gameLog],season=${year})`)
        //                                                     .then(response => {
        //                                                         if (!response.ok) {
        //                                                             throw new Error('Network response was not ok');
        //                                                         }
        //                                                         return response.json();
        //                                                     })
        //                                                     .then(allStats => {
        //                                                         // console.log('allStats');
        //                                                         // console.log(allStats);
        //                                                         var gameLogInfo = allStats['people'][0]['stats'][2]['splits'];
        //                                                         // only get game log, not season info?
        //                                                         // console.log('gameLogInfo');
        //                                                         // console.log(gameLogInfo);

        //                                                         // TODO: use this
        //                                                         // if (playerPosition == 'Pitcher') {
        //                                                         //     var seasonPitching = stats.find(item =>
        //                                                         //         item.type.displayName === 'season' &&
        //                                                         //         item.group.displayName === 'pitching'
        //                                                         //     );

        //                                                         var datesPlayed = [];
        //                                                         for (let i = 0; i < gameLogInfo.length; i++) {
        //                                                             // datesPlayed.push(gameLogInfo[i]['date']);
        //                                                             // var datePlayed = new Date(gameLogInfo[i]['date']);
        //                                                             // console.log(gameLogInfo[i]);
        //                                                             // console.log(gameLogInfo[i]['date']);
        //                                                             var datePlayed = new Date(`${gameLogInfo[i]['date']}T00:00:00`);
        //                                                             var datePlayedEnd = new Date(datePlayed);
        //                                                             datePlayedEnd.setDate(datePlayedEnd.getDate() + 1);
        //                                                             datesPlayed.push([datePlayed, datePlayedEnd]);
        //                                                         }
        //                                                         // console.log('datesPlayed');
        //                                                         // console.log(datesPlayed);

        //                                                         var datasets = [
        //                                                             {
        //                                                                 label: 'Games Played',
        //                                                                 data: datesPlayed.map(dates => ({
        //                                                                     x: dates,
        //                                                                     y: 'Games'
        //                                                                 })),
        //                                                                 backgroundColor: 'rgba(100, 200, 200, 0.8)'
        //                                                             }
        //                                                         ];
        //                                                         for (let i = 0; i < allTeams.length; i++) {
        //                                                             datasets.push(
        //                                                                 {
        //                                                                     label: 'Inactive',
        //                                                                     data: inactiveDates[allTeams[i]['abr']].map(dates => ({
        //                                                                         x: dates,
        //                                                                         // y: 'Roster'
        //                                                                         y: allTeams[i]['abr']
        //                                                                     })),
        //                                                                     backgroundColor: 'rgba(200, 100, 100, 0.8)'
        //                                                                 },
        //                                                             );
        //                                                             datasets.push(
        //                                                                 {
        //                                                                     label: 'Active',
        //                                                                     data: activeDates[allTeams[i]['abr']].map(dates => ({
        //                                                                         x: dates,
        //                                                                         // y: 'Roster'
        //                                                                         y: allTeams[i]['abr']
        //                                                                         // y: ''/
        //                                                                     })),
        //                                                                     backgroundColor: 'rgba(100, 200, 100, 0.8)'
        //                                                                 },
        //                                                             );
        //                                                         }

        //                                                         var data = {
        //                                                             datasets: datasets
        //                                                         };

        //                                                         // console.log('time data');
        //                                                         // console.log(data);

        //                                                         var imagePromises = [];
        //                                                         for (let i = 0; i < allTeams.length; i++) {
        //                                                             // console.log(Consts.teamsDetails[allTeams[i]['name']][0]);
        //                                                             imagePromises.push(loadSVGToImage(Consts.teamInfo[allTeams[i]['name']][0]));
        //                                                             // imagePromises.push(Consts.teamsDetails[allTeams[i]['name']][0]);
        //                                                         }

        //                                                         Promise.all(imagePromises).then((teamLogos) => {
        //                                                             activeStatusTimePlot = new Chart(activeStatusTimePlotCanvas, {
        //                                                                 type: 'bar',
        //                                                                 data: data,
        //                                                                 options: {
        //                                                                     indexAxis: 'y',
        //                                                                     responsive: true,
        //                                                                     layout: {
        //                                                                         padding: {
        //                                                                             left: 15,
        //                                                                             right: 30
        //                                                                         }
        //                                                                     },
        //                                                                     scales: {
        //                                                                         x: {
        //                                                                             min: new Date(`${seasonInfo['seasons'][0]['regularSeasonStartDate']}T00:00:00`), // TODO: use months as ticks
        //                                                                             max: seasonEndDate,
        //                                                                             border: {
        //                                                                                 display: false
        //                                                                             },
        //                                                                             ticks: {
        //                                                                                 color: 'white',
        //                                                                                 font: {
        //                                                                                     size: 18
        //                                                                                 }
        //                                                                             },
        //                                                                             grid: {
        //                                                                                 color: 'white'
        //                                                                             },
        //                                                                             type: 'time',
        //                                                                             time: {
        //                                                                                 unit: 'day'
        //                                                                             }
        //                                                                         },
        //                                                                         y: {
        //                                                                             border: {
        //                                                                                 display: false
        //                                                                             },
        //                                                                             ticks: {
        //                                                                                 color: function (context) {
        //                                                                                     if (context.index === 0) {
        //                                                                                         return 'white';
        //                                                                                     }
        //                                                                                     return 'rgba(0, 0, 0, 0)';
        //                                                                                 },
        //                                                                                 font: {
        //                                                                                     size: 18
        //                                                                                 },
        //                                                                                 padding: 10
        //                                                                             },
        //                                                                             grid: {
        //                                                                                 color: 'white'
        //                                                                             },
        //                                                                             beginAtZero: true,
        //                                                                             stacked: true
        //          


    }, [selectedPlayer]);

    return (
        <>
            {/* <StatsModal open={modalOpen} handleClose={handleModalClose} modalData={modalData} /> */}
            {playerInfo && <Box sx={{ bgcolor: theme.palette.custom.darkGray, padding: 4 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="h4">
                        {playerInfo.fullName}
                    </Typography>
                    <Typography variant="h4">
                        #{playerInfo.primaryNumber}
                    </Typography>
                    <img src={selectedTeamLogo} style={{ width: 40, height: 40 }} />
                </Box>
                <Box sx={{ display: 'flex' }}>
                    <Stack direction='column'>
                        <Box sx={{ display: 'flex' }}>
                            <img src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${selectedPlayer}/headshot/silo/current`} />
                            <Box>
                                <Table sx={{ border: 'none !important', maxWidth: 350, '& td': { border: 'none', py: 0.5 } }} size="small">
                                    <TableBody sx={{ border: 'none' }}>
                                        {bioRows.map((row) => (
                                            <TableRow key={row.label}>
                                                <TableCell sx={{ width: '120px', fontWeight: 'bold', pl: 0 }} align="left">
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
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                                component="a"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={playerURL}
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
                            <Chip
                                component="a"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={storyURL}
                                label="Story"
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
                        </Box>
                    </Stack>
                </Box>
                <Box sx={{ mt: 2, height: '30px', backgroundColor: selectedTeam ? Consts.teamInfo[selectedTeam].colors.primary : '' }}></Box>
                <Box sx={{ height: '20px', backgroundColor: selectedTeam ? Consts.teamInfo[selectedTeam].colors.secondary : '' }}></Box>
                <Box>
                    <FormControlLabel control={<Switch onChange={allYearsToggle} checked={allYearsChecked} />} label='All years' />
                    <FormControlLabel control={<Switch onChange={groupTeamsToggle} checked={groupTeamsChecked} />} label='Group teams' />
                </Box>
                {['Pitcher', 'Two-Way Player'].includes(playerInfo.primaryPosition.name) ? <>
                    <Typography variant="h6">Pitcher stats</Typography>
                    {pitcherStats && <Box sx={{
                        width: 1200,
                        '& .dataTable tbody tr:hover': {
                            backgroundColor: (theme) => `${theme.palette.custom.lightGray} !important`,
                        },
                        '& table.dataTable tbody tr.selected *, & table.dataTable tbody tr td.selected *': {
                            backgroundColor: (theme) => `${theme.palette.custom.dark} !important`,
                            boxShadow: 'none !important'
                        },
                    }}>
                        <DataTable
                            data={displayedPitcherStats}
                            columns={pitcherStatsColumns}
                            options={{
                                select: {
                                    info: false
                                },
                                paging: false,
                                info: false,
                                ordering: false,
                                dom: "t",
                                destroy: true,
                            }}
                            onSelect={handlePitcherRowSelect}
                            onDeselect={handlePitcherRowDeselect}
                        />
                    </Box>
                    }
                    {pitcherYearDetails.isLoading && <>
                        <LoadingCircle size={60} />
                    </>}
                    {pitcherYearDetails.year &&
                        <Typography variant='h4'>{pitcherYearDetails.year}</Typography>
                    }
                    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                        {pitcherYearDetails.pitchArsenal &&
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '600px' }}>
                                <Typography variant='h5'>Pitch Arsenal (Total: {totalPitches})</Typography>
                                <PitchArsenalChart pitchArsenal={pitcherYearDetails.pitchArsenal} />
                            </Box>
                        }
                        {pitcherYearDetails.pitchSpeeds &&
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '600px' }}>
                                <Typography variant='h5'>Pitch Speeds</Typography>
                                <PitchSpeedsChart pitchSpeeds={pitcherYearDetails.pitchSpeeds} />
                            </Box>
                        }
                    </Box>
                    {allSeasonPitches &&
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '1200px' }}>
                            <Typography variant='h5'>All Pitches</Typography>
                            <AllSeasonPitchesChart allSeasonPitches={allSeasonPitches} />
                        </Box>
                    }
                    {seasonInningsPitched.length > 0 &&
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '1200px' }}>
                            <Typography variant='h5'>Innings Pitched</Typography>
                            <InningsPitchedChart seasonInningsPitched={seasonInningsPitched} />
                        </Box>
                    }
                    {pitcherYearDetails.gameLog && <Box sx={{
                        width: 1200,
                        '& .dataTable tbody tr:hover': {
                            backgroundColor: (theme) => `${theme.palette.custom.lightGray} !important`,
                        },
                        '& table.dataTable tbody tr.selected *, & table.dataTable tbody tr td.selected *': {
                            backgroundColor: (theme) => `${theme.palette.custom.dark} !important`,
                            boxShadow: 'none !important'
                        },
                    }}>
                        <Typography variant='h5'>Game Log</Typography>
                        <DataTable
                            data={pitcherYearDetails.gameLog}
                            columns={pitcherGameLogColumns}
                            options={{
                                select: {
                                    info: false
                                },
                                paging: false,
                                info: false,
                                ordering: false,
                                dom: "t",
                                destroy: true,
                            }}
                            onSelect={handlePitcherGameRowSelect}
                            onDeselect={handlePitcherGameRowDeselect}
                        />
                    </Box>
                    }
                    {selectedPitcherGamePitches &&
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '1200px' }}>
                            <Typography variant='h5'>Game Pitches</Typography>
                            <GamePitchesChart selectedPitcherGamePitches={selectedPitcherGamePitches} />
                        </Box>
                    }
                    {selectedPitcherGamePitchesVelocity &&
                        <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '1200px' }}>
                            <Typography variant='h5'>Game Pitches Velocity</Typography>
                            <GamePitchesVelocityChart selectedPitcherGamePitchesVelocity={selectedPitcherGamePitchesVelocity} />
                        </Box>
                    }
                </> : <>
                    <Typography variant="h6">hitter stats</Typography>
                </>
                }
                {/* <div id="hitting-stats-container">
                    <table id="hitting-stats">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Team</th>
                                <th><span className="tooltip" data-tooltip="At bats">AB</span></th>
                                <th><span className="tooltip" data-tooltip="Runs">R</span></th>
                                <th><span className="tooltip" data-tooltip="Hits">H</span></th>
                                <th><span className="tooltip" data-tooltip="Home runs">HR</span></th>
                                <th><span className="tooltip" data-tooltip="Runs batted in">RBI</span></th>
                                <th><span className="tooltip" data-tooltip="Stolen bases">SB</span></th>
                                <th><span className="tooltip" data-tooltip="Batting average">AVG</span></th>
                                <th><span className="tooltip" data-tooltip="On-base %">OPB</span></th>
                                <th><span className="tooltip" data-tooltip="Slugging %">SLG</span></th>
                                <th><span className="tooltip" data-tooltip="On-base + slugging">OPS</span></th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    <div id="hitting-stats-year-select-container"></div>
                    <div id="hits-pie-chart">
                        <canvas></canvas>
                    </div>
                    <div id="hits-scatter-plot">
                        <canvas></canvas>
                    </div>
                    <h2>Game Log</h2>
                    <table id="hitting-game-log">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Matchup</th>
                                <th>Summary</th>
                                <th><span className="tooltip" data-tooltip="At bats">AB</span></th>
                                <th><span className="tooltip" data-tooltip="Hits">H</span></th>
                                <th><span className="tooltip" data-tooltip="Home runs">HR</span></th>
                                <th><span className="tooltip" data-tooltip="Walks">BB</span></th>
                                <th><span className="tooltip" data-tooltip="Strikeouts">SO</span></th>
                                <th><span className="tooltip" data-tooltip="RBI">RBI</span></th>
                                <th>Total Bases</th>
                                <th>link</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div> */}
                {/* <div id="generic-stats-container">
                    <h2 style={{ marginTop: '0px' }}>More Stats</h2>
                    <div id="active-status-time-plot">
                        <canvas></canvas>
                    </div>
                    <div id="game-stats">
                        <button type="button" id="x-button" className="small-margin" disabled>X</button>
                        <button type="button" id="details-button" className="small-margin" disabled>Details</button>
                        <h2>Game stats<span id="game-log-summary"></span></h2>
                        <p id="game-log-details"></p>
                    </div>
                </div> */}
                {awards &&
                    <Awards awards={awards} theme={theme} />
                }
                {/* <div id="missing-stats-container">
                    <Typography variant="h5" noWrap component="div" sx={{ mt: 5 }}>
                        No stats
                    </Typography>
                </div> */}
            </Box>
            }
        </>
    )
}
