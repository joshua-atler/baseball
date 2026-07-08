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

const PitchTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const pitch = payload[0].payload;

        return (
            <div style={{
                backgroundColor: '#222',
                border: '1px solid #444',
                padding: '10px',
                borderRadius: '6px',
                boxShadow: '0px 4px 10px rgba(0,0,0,0.5)'
            }}>
                <p style={{ margin: 0, color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
                    {/* {pitch.pitchType} */}
                    {pitch.details.type.description}
                </p>
                <p style={{ margin: '4px 0 0 0', color: '#aaa', fontSize: '12px' }}>
                    Velocity: <span style={{ color: '#fff', fontWeight: '600' }}>{pitch.pitchData.startSpeed} MPH</span>
                </p>
            </div>
        );
    }
    return null;
};

const handleScatterClick = (data, index) => {
    window.open(`https://baseballsavant.mlb.com/sporty-videos?playId=${data.playId}`, '_blank', 'noopener,noreferrer');
};

// const style = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: 800,
//     bgcolor: 'background.paper',
//     border: '2px solid #000',
//     boxShadow: 24,
//     p: 4,
// };


// function StatsModal({ open, handleClose, modalData }) {

//     const canvasRef = React.useRef(null);

//     React.useEffect(() => {
//         if (!open) return;
//         setTimeout(() => {
//             const statsModalLineChartCanvas = document.querySelector('#stats-modal-chart canvas');
//             var statsModalLineChart = null;

//             if (Object.keys(modalData).length === 0) {
//                 statsModalLineChart?.destroy();
//             } else {
//                 statsModalLineChart = new Chart(statsModalLineChartCanvas, {
//                     type: 'line',
//                     data: {
//                         labels: [...modalData.years].reverse(),
//                         datasets: [{
//                             data: [...modalData.columnData].reverse(),
//                             label: ''
//                         }]
//                     },
//                     options: {
//                         scales: {
//                             x: {
//                                 border: {
//                                     display: false
//                                 },
//                                 ticks: {
//                                     color: 'white',
//                                     font: {
//                                         size: 18
//                                     }
//                                 },
//                                 grid: {
//                                     color: 'white',
//                                     z: 1
//                                 }
//                             },
//                             y: {
//                                 ticks: {
//                                     color: 'white',
//                                     font: {
//                                         size: 18
//                                     }
//                                 }
//                             }
//                         },
//                         plugins: {
//                             legend: {
//                                 display: false,
//                             }
//                         }
//                     }
//                 });
//             }
//         }, 50);
//     }, [open, modalData]);

//     return (
//         <Modal open={open} onClose={handleClose}>
//             <Box sx={style}>
//                 <h2>{modalData.statTitle}</h2>
//                 <div id="stats-modal-chart">
//                     <canvas ref={canvasRef}></canvas>
//                 </div>
//                 <Button onClick={handleClose}>Close</Button>
//             </Box>
//         </Modal>
//     );
// }

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
        // { data: 'id', title: '', visible: false },
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

                // if (data?.length > 0) {
                //     const logoURL = Consts.teamInfo[data].logo;
                //     return `<img src=${logoURL} style="width: 40px; height: 40px" />`
                // } else {
                //     return '';
                // }
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

    /////////////////

    //     setSelectedGame(pitcherYearDetails.gameLog[indexes].gamePk);
    // setSelectedGameMetadata({
    //     tickets: pitcherYearDetails.gameLog[indexes].gameMetadata.tickets,
    //     broadcasts: pitcherYearDetails.gameLog[indexes].gameMetadata.brodcasts,
    //     seriesStatus: pitcherYearDetails.gameLog[indexes].gameMetadata.seriesStatus
    // })
    // navigate('/games');


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
                // const pitchLog = [
                //     {
                //         "pitchType": "Fastball",
                //         "velocity": 96.4,
                //         "gamePk": 745231,
                //         "playId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
                //     },
                //     {
                //         "pitchType": "Fastball",
                //         "velocity": 84.2,
                //         "gamePk": 745231,
                //         "playId": "b2c3d4e5-f67a-8b9c-0d1e-2f3a4b5c6d7e"
                //     },
                //     {
                //         "pitchType": "Curveball",
                //         "velocity": 97.1,
                //         "gamePk": 745231,
                //         "playId": "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f"
                //     },
                //     {
                //         "pitchType": "Cutter",
                //         "velocity": 76.8,
                //         "gamePk": 745288,
                //         "playId": "d4e5f67a-8b9c-0d1e-2f3a-4b5c6d7e8f9a"
                //     }
                // ];

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

        // https://statsapi.mlb.com/api/v1/people/${playerID}?&hydrate=stats(group=[pitching],type=[pitchArsenal,gameLog,metricAverage],metrics=[releaseSpeed],limit=10000,season=${year})
    };

    // console.log('pitcherYearDetails');
    // console.log(pitcherYearDetails);

    // console.log(PITCH_COLORS);

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

    const handlePitcherGameRowDeselect = (e, dt, type, indexes) => {
        setSelectedPitcherGamePitches(null);
        setSelectedPitcherGamePitchesVelocity(null);
    };

    // const data01 = [
    //     { x: 100, y: 200, z: 200 },
    //     { x: 120, y: 100, z: 260 },
    //     { x: 170, y: 300, z: 400 },
    //     { x: 140, y: 250, z: 280 },
    //     { x: 150, y: 400, z: 500 },
    //     { x: 110, y: 280, z: 200 },
    // ];

    // const data02 = [
    //     { x: 200, y: 260, z: 240 },
    //     { x: 240, y: 290, z: 220 },
    //     { x: 190, y: 290, z: 250 },
    //     { x: 198, y: 250, z: 210 },
    //     { x: 180, y: 280, z: 260 },
    //     { x: 210, y: 220, z: 230 },
    // ];


    // function pitchColors(pitchType) {
    //     var pitchColorsTable = {
    //         'FA': 'rgba(55, 160, 235, 0.8)',
    //         'FF': 'rgba(55, 160, 235, 0.8)',
    //         'FC': 'rgba(255, 100, 130, 0.8)',
    //         'FS': 'rgba(75, 200, 200, 0.8)',
    //         'SI': 'rgba(255, 160, 60, 0.8)',
    //         'ST': 'rgba(50, 100, 150, 0.8)',
    //         'SL': 'rgba(100, 200, 50, 0.8)',
    //         'CU': 'rgba(255, 200, 85, 0.8)',
    //         'KC': 'rgba(85, 255, 200, 0.8)',
    //         'CH': 'rgba(100, 50, 255, 0.8)',
    //     };

    //     if (pitchType in pitchColorsTable) {
    //         return pitchColorsTable[pitchType];
    //     } else {
    //         return 'rgba(0, 0, 0, 0.8)';
    //     }
    // }

    // function hitColors(hitType) {
    //     var hitColorsTable = {
    //         'Single': 'rgba(55, 160, 235, 0.8)',
    //         'Double': 'rgba(255, 100, 130, 0.8)',
    //         'Triple': 'rgba(100, 200, 50, 0.8)',
    //         'Home Run': 'rgba(200, 0, 0, 0.8)'
    //     };

    //     if (hitType in hitColorsTable) {
    //         return hitColorsTable[hitType];
    //     } else {
    //         return 'rgba(0, 0, 0, 0.8)';
    //     }
    // }

    // function formatInnings(num) {
    //     let wholePart = Math.floor(num);
    //     let fractionalPart = num - wholePart;
    //     const tolerance = 1e-9;

    //     let fraction = '';
    //     if (Math.abs(fractionalPart - 1 / 3) < tolerance) {
    //         fraction = '.1';
    //     } else if (Math.abs(fractionalPart - 2 / 3) < tolerance) {
    //         fraction = '.2';
    //     } else {
    //         fraction = '.0';
    //     }

    //     return wholePart + fraction;
    // }

    // function loadSVGToImage(svgText) {
    //     return new Promise((resolve, reject) => {
    //         // const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);

    //         const img = new Image();
    //         img.src = svgText;
    //         img.onload = () => resolve(img);
    //         img.onerror = () => reject(new Error('Error loading SVG image'));
    //     });
    // }

    // function openCloseAllYears(allYears) {
    //     if (allYears) {
    //         if (playerPosition == 'Pitcher') {
    //             updatePitchingStatsTable([...seasonPitchingForAllYears, careerPitching]);
    //         } else {
    //             updateHittingStatsTable([...seasonHittingForAllYears, careerHitting]);
    //         }
    //     } else {
    //         if (playerPosition == 'Pitcher') {
    //             updatePitchingStatsTable(seasonPitching !== undefined
    //                 ? [seasonPitching, careerPitching]
    //                 : [careerPitching]);
    //         } else {
    //             updateHittingStatsTable(seasonHitting !== undefined
    //                 ? [seasonHitting, careerHitting]
    //                 : [careerHitting]);
    //         }
    //     }
    // }
    // openCloseAllYears(allYearsChecked);

    // function updatePitchingStatsTable(allPitching) {
    //     if (allPitching.every(obj => Object.keys(obj).length === 0)) {
    //         return;
    //     };
    //     pitchingStatsDT = $(document.querySelector('#pitching-stats')).DataTable();
    //     pitchingStatsDT.clear();

    //     var dropdownRowIndices = [];
    //     var subRowIndices = [];
    //     var rowIndex = 0;

    //     // console.log('seasonsPitching');
    //     // console.log(seasonsPitching);

    //     for (let i = 0; i < allPitching.length; i++) {
    //         var splits;
    //         if (allPitching[i]['splits'].length > 1) {
    //             splits = [allPitching[i]['splits'][0], ...allPitching[i]['splits'].slice(1)];
    //         } else {
    //             splits = allPitching[i]['splits'];
    //         }

    //         for (let j = 0; j < splits.length; j++) {
    //             var pitchingRow = splits[j];
    //             var seasonYear;
    //             if ('season' in pitchingRow) {
    //                 seasonYear = pitchingRow['season'];
    //             } else {
    //                 seasonYear = 'Career';
    //             }

    //             var team;
    //             if (seasonYear == 'Career') {
    //                 team = '';
    //             } else if ('team' in pitchingRow) {
    //                 team = pitchingRow['team']['name'];
    //                 team = `<img width="30" height="30" class="logo" src="${Consts.teamInfo[team][0]}">`;
    //             } else {
    //                 team = pitchingRow['numTeams'];
    //             }

    //             if (j == 0 && splits.length > 1) {
    //                 seasonYear += `&nbsp; ${svgDownArrow}`;
    //                 dropdownRowIndices.push(rowIndex);
    //             }

    //             pitchingStatsDT.row.add([
    //                 `${seasonYear}`,
    //                 `${team}`,
    //                 pitchingRow['stat']['wins'],
    //                 pitchingRow['stat']['losses'],
    //                 pitchingRow['stat']['era'],
    //                 pitchingRow['stat']['gamesPitched'],
    //                 pitchingRow['stat']['gamesStarted'],
    //                 pitchingRow['stat']['saves'],
    //                 pitchingRow['stat']['inningsPitched'],
    //                 pitchingRow['stat']['strikeOuts'],
    //                 pitchingRow['stat']['whip'],
    //             ]);

    //             if (j > 0) {
    //                 subRowIndices.push(rowIndex);
    //             }

    //             rowIndex += 1;
    //         }
    //     }

    //     pitchingStatsDT.draw(true);

    //     $('#pitching-stats th, #pitching-stats td').off('click').on('click', function () {
    //         var colIndex = $(this).index();
    //         if (colIndex >= 2 && allYearsChecked) {
    //             var clickedColumn = pitchingStatsDT.column($(this).index());
    //             var columnData = pitchingStatsDT.column($(this).index()).data().toArray();
    //             var years = pitchingStatsDT.column(0).data().toArray();
    //             var statTitle = clickedColumn.header().querySelector('span.tooltip').getAttribute('data-tooltip');

    //             const seen = new Set();
    //             const resultIndexes = [];
    //             years.forEach((item, index) => {
    //                 const match = item.match(/\b\d{4}\b/);
    //                 if (match) {
    //                     const year = match[0];
    //                     if (!seen.has(year)) {
    //                         seen.add(year);
    //                         resultIndexes.push(index);
    //                     }
    //                 }
    //             });
    //             years = resultIndexes.map(index => years[index]);
    //             years = years.map(year => year.slice(0, 4));
    //             columnData = resultIndexes.map(index => columnData[index]);

    //             setModalData({
    //                 statTitle: statTitle,
    //                 years: years,
    //                 columnData: columnData
    //             });
    //             setModalOpen(true);
    //             $('#pitching-stats td, #pitching-stats th').removeClass('table-highlight');
    //         }
    //     });

    //     $('#pitching-stats th, #pitching-stats td').off('mouseenter').off('mouseleave').on('mouseenter', function () {
    //         if (($(this).index() >= 2)) {
    //             const colIndex = $(this).index();
    //             $('#pitching-stats tr').each(function () {
    //                 $(this).find('td, th').eq(colIndex).addClass('table-highlight');
    //             });
    //         }
    //     }).on('mouseleave', function () {
    //         $('#pitching-stats td, #pitching-stats th').removeClass('table-highlight');
    //     });

    //     let dropdownRows = pitchingStatsDT.rows(dropdownRowIndices).nodes();
    //     let subRows = pitchingStatsDT.rows(subRowIndices).nodes();

    //     $(dropdownRows).each(function (index, dropdownRow) {
    //         $(dropdownRow).find('td').first().on('click', function () {
    //             let svgArrow = $(dropdownRow).find('td:first svg');
    //             var direction = svgArrow.attr('data-direction');

    //             if (direction == 'up') {
    //                 svgArrow.replaceWith(svgDownArrow);
    //             } else {
    //                 svgArrow.replaceWith(svgUpArrow);
    //             }

    //             let nextRows = $(dropdownRow).nextAll('tr');
    //             let matchingRows = [];

    //             nextRows.each(function (i, nextRow) {
    //                 if ($(nextRow).hasClass('stats-subrow')) {
    //                     matchingRows.push(nextRow);
    //                 } else {
    //                     return false;
    //                 }
    //             });

    //             $(matchingRows).each(function (i, subRow) {
    //                 $(subRow).toggleClass('stats-subrow-hidden');
    //             });
    //         });
    //     });

    //     $(subRows).each(function (index, subRow) {
    //         $(subRow).addClass('stats-subrow');
    //         $(subRow).addClass('stats-subrow-hidden');
    //     });
    // }

    // function updateHittingStatsTable(allHitting) {
    //     if (allHitting.every(obj => Object.keys(obj).length === 0)) {
    //         return;
    //     };
    //     hittingStatsDT = $(document.querySelector('#hitting-stats')).DataTable();
    //     hittingStatsDT.clear();

    //     var dropdownRowIndices = [];
    //     var subRowIndices = [];
    //     var rowIndex = 0;

    //     for (let i = 0; i < allHitting.length; i++) {
    //         var splits;
    //         if (allHitting[i]['splits'].length > 1) {
    //             splits = [allHitting[i]['splits'][0], ...allHitting[i]['splits'].slice(1)];
    //         } else {
    //             splits = allHitting[i]['splits'];
    //         }

    //         for (let j = 0; j < splits.length; j++) {
    //             var hittingRow = splits[j];
    //             var seasonYear;
    //             if ('season' in hittingRow) {
    //                 seasonYear = hittingRow['season'];
    //             } else {
    //                 seasonYear = 'Career';
    //             }

    //             var team;
    //             if (seasonYear == 'Career') {
    //                 team = '';
    //             } else if ('team' in hittingRow) {
    //                 team = hittingRow['team']['name'];
    //                 team = `<img width="30" height="30" class="logo" src="${Consts.teamInfo[team][0]}">`;
    //             } else {
    //                 team = hittingRow['numTeams'];
    //             }

    //             if (j == 0 && splits.length > 1) {
    //                 seasonYear += `&nbsp; ${svgDownArrow}`;
    //                 dropdownRowIndices.push(rowIndex);
    //             }

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

    //             if (j > 0) {
    //                 subRowIndices.push(rowIndex);
    //             }

    //             rowIndex += 1;
    //         }
    //     }

    //     hittingStatsDT.draw(true);

    //     $('#hitting-stats th, #hitting-stats td').off('click').on('click', function () {
    //         var colIndex = $(this).index();
    //         if (colIndex >= 2 && allYearsChecked) {
    //             var clickedColumn = hittingStatsDT.column($(this).index());
    //             var columnData = hittingStatsDT.column($(this).index()).data().toArray();
    //             var years = hittingStatsDT.column(0).data().toArray();
    //             var statTitle = clickedColumn.header().querySelector('span.tooltip').getAttribute('data-tooltip');

    //             const seen = new Set();
    //             const resultIndexes = [];
    //             years.forEach((item, index) => {
    //                 const match = item.match(/\b\d{4}\b/);
    //                 if (match) {
    //                     const year = match[0];
    //                     if (!seen.has(year)) {
    //                         seen.add(year);
    //                         resultIndexes.push(index);
    //                     }
    //                 }
    //             });
    //             years = resultIndexes.map(index => years[index]);
    //             years = years.map(year => year.slice(0, 4));
    //             columnData = resultIndexes.map(index => columnData[index]);

    //             setModalData({
    //                 statTitle: statTitle,
    //                 years: years,
    //                 columnData: columnData
    //             });
    //             setModalOpen(true);
    //             $('#hitting-stats td, #hitting-stats th').removeClass('table-highlight');
    //         }
    //     });

    //     $('#hitting-stats th, #hitting-stats td').off('mouseenter').off('mouseleave').on('mouseenter', function () {
    //         if (($(this).index() >= 2)) {
    //             const colIndex = $(this).index();
    //             $('#hitting-stats tr').each(function () {
    //                 $(this).find('td, th').eq(colIndex).addClass('table-highlight');
    //             });
    //         }
    //     }).on('mouseleave', function () {
    //         $('#hitting-stats td, #hitting-stats th').removeClass('table-highlight');
    //     });

    //     let dropdownRows = hittingStatsDT.rows(dropdownRowIndices).nodes();
    //     let subRows = hittingStatsDT.rows(subRowIndices).nodes();

    //     $(dropdownRows).each(function (index, dropdownRow) {
    //         $(dropdownRow).find('td').first().on('click', function () {
    //             let svgArrow = $(dropdownRow).find('td:first svg');
    //             var direction = svgArrow.attr('data-direction');

    //             if (direction == 'up') {
    //                 svgArrow.replaceWith(svgDownArrow);
    //             } else {
    //                 svgArrow.replaceWith(svgUpArrow);
    //             }

    //             let nextRows = $(dropdownRow).nextAll('tr');
    //             let matchingRows = [];

    //             nextRows.each(function (i, nextRow) {
    //                 if ($(nextRow).hasClass('stats-subrow')) {
    //                     matchingRows.push(nextRow);
    //                 } else {
    //                     return false;
    //                 }
    //             });

    //             $(matchingRows).each(function (i, subRow) {
    //                 $(subRow).toggleClass('stats-subrow-hidden');
    //             });
    //         });
    //     });

    //     $(subRows).each(function (index, subRow) {
    //         $(subRow).addClass('stats-subrow');
    //         $(subRow).addClass('stats-subrow-hidden');
    //     });
    // }

    // console.log('playerInfo');
    // console.log(playerInfo);

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

        const playerStatsPhoto = $(document.querySelector('#player-stats-photo'));
        const playerStatsLabel = $(document.querySelector('#player-stats-label'));
        const playerDetails = $(document.querySelector('#player-details'));
        const teamColorBanners = $(document.querySelectorAll('.player-team-color-banner'));

        const allYearsSwitch = $(document.querySelector('#all-years-switch'));
        const pitchingYearSelectDiv = $(document.querySelector('#pitching-stats-year-select-container'));
        const hittingYearSelectDiv = $(document.querySelector('#hitting-stats-year-select-container'));

        const pitchingStatsDiv = $(document.querySelector('#pitching-stats-container'));
        const hittingStatsDiv = $(document.querySelector('#hitting-stats-container'));
        const genericStatsDiv = $(document.querySelector('#generic-stats-container'));
        const missingStatsDiv = $(document.querySelector('#missing-stats-container'));

        // pitching charts
        const pitchesPieChartCanvas = $(document.querySelector('#pitches-pie-chart canvas'));
        var pitchesPieChart = Chart.getChart(pitchesPieChartCanvas);

        const pitchesScatterPlotCanvas = $(document.querySelector('#pitches-scatter-plot canvas'));
        var pitchesScatterPlot = Chart.getChart(pitchesScatterPlotCanvas);

        const strikeZonesDiv = $(document.querySelector('#strike-zones'));

        const eraLineChartCanvas = $(document.querySelector('#era-line-chart canvas'));
        var eraLineChart = Chart.getChart(eraLineChartCanvas);

        const inningsPitchedBarChartCanvas = $(document.querySelector('#innings-pitched-bar-chart canvas'));
        var inningsPitchedBarChart = Chart.getChart(inningsPitchedBarChartCanvas);

        // hitting charts
        const hitsPieChartCanvas = $(document.querySelector('#hits-pie-chart canvas'));
        var hitsPieChart = Chart.getChart(hitsPieChartCanvas);

        const hitsScatterPlotCanvas = $(document.querySelector('#hits-scatter-plot canvas'));
        var hitsScatterPlot = Chart.getChart(hitsScatterPlotCanvas);

        // generic charts
        const activeStatusTimePlotCanvas = $(document.querySelector('#active-status-time-plot canvas'));
        var activeStatusTimePlot = Chart.getChart(activeStatusTimePlotCanvas);

        var pitchingStatsTable = document.querySelector('#pitching-stats');
        var pitchingGameLogTable = document.querySelector('#pitching-game-log');

        /////////////////////////////////////////////////////////////////////


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

        // if ($.fn.dataTable.isDataTable(pitchingStatsTable)) {
        //     pitchingStatsDT = $(pitchingStatsTable).DataTable();
        // } else {
        //     pitchingStatsDT = $(pitchingStatsTable).DataTable({
        //         pageLength: 50,
        //         dom: 't',
        //         columnDefs: [],
        //         ordering: false,
        //         buttons: [],
        //         scrollCollapse: true
        //     });
        // }

        // if ($.fn.dataTable.isDataTable(pitchingGameLogTable)) {
        //     pitchingGameLogDT = $(pitchingGameLogTable).DataTable();
        // } else {
        //     pitchingGameLogDT = $(pitchingGameLogTable).DataTable({
        //         select: {
        //             info: false
        //         },
        //         paging: true,
        //         dom: 'tip',
        //         columnDefs: [],
        //         ordering: false,
        //         buttons: [],
        //         scrollCollapse: true,
        //         columnDefs: [
        //             { targets: 10, visible: false }
        //         ]
        //     });
        // }

        // var hittingStatsTable = document.querySelector('#hitting-stats');
        // var hittingGameLogTable = document.querySelector('#hitting-game-log');

        // if ($.fn.dataTable.isDataTable(hittingStatsTable)) {
        //     var hittingStatsDT = $(hittingStatsTable).DataTable();
        // } else {
        //     var hittingStatsDT = $(hittingStatsTable).DataTable({
        //         pageLength: 50,
        //         dom: 't',
        //         columnDefs: [],
        //         ordering: false,
        //         buttons: [],
        //         scrollCollapse: true
        //     });
        // }

        // if ($.fn.dataTable.isDataTable(hittingGameLogTable)) {
        //     hittingGameLogDT = $(hittingGameLogTable).DataTable();
        // } else {
        //     hittingGameLogDT = $(hittingGameLogTable).DataTable({
        //         select: {
        //             info: false
        //         },
        //         paging: true,
        //         dom: 'tip',
        //         columnDefs: [],
        //         ordering: false,
        //         buttons: [],
        //         scrollCollapse: true,
        //         columnDefs: [
        //             { targets: 10, visible: false }
        //         ]
        //     });
        // }

        // var gameDataToSend;
        // const detailsButton = $(document.querySelector('#details-button'));
        // const xButton = $(document.querySelector('#x-button'));
        // const gameLogSummary = $(document.querySelector('#game-log-summary'));
        // const gameLogDetails = $(document.querySelector('#game-log-details'));

        // const startYear = 2015;

        // function hideAllStats() {
        //     playerStatsPhoto.html('');
        //     playerStatsLabel.html('');

        //     playerDetails.hide();
        //     playerDetails.find('li:nth-child(1) span:nth-child(2)').html('');
        //     playerDetails.find('li:nth-child(2) span:nth-child(2)').html('');
        //     playerDetails.find('li:nth-child(3) span:nth-child(2)').html('');
        //     playerDetails.find('li:nth-child(4) span:nth-child(2)').html('');

        //     teamColorBanners.css('background-color', 'transparent');

        //     pitchingStatsDiv.hide();
        //     hittingStatsDiv.hide();
        //     genericStatsDiv.hide();
        //     missingStatsDiv.hide();

        //     gameLogSummary.html('');
        //     gameLogDetails.html('<br><br><br><br>');
        // }

        // hideAllStats();


        // playerID = selectedPlayer.playerID;
        // teamColor = selectedPlayer.color;

        // allYearsSwitch.hide();
        // pitchingYearSelectDiv.html('');
        // hittingYearSelectDiv.html('');

        // function destroyCharts() {
        //     var charts = [
        //         pitchesPieChart,
        //         pitchesScatterPlot,
        //         eraLineChart,
        //         inningsPitchedBarChart,
        //         hitsPieChart,
        //         hitsScatterPlot,
        //         activeStatusTimePlot];

        //     charts.forEach(chart => {
        //         if (chart) {
        //             try {
        //                 chart.destroy();
        //             } catch (error) {
        //                 console.error("Failed to destroy chart:", error);
        //             }
        //         }
        //     });
        // }
        // destroyCharts();

        //     strikeZonesDiv.html('');

        //     if (playerID == null) {
        //         setPlayerPosition('');
        //         setSeasonPitchingForAllYears([]);
        //         setSeasonPitching({});
        //         setCareerPitching({});

        //         setSeasonHittingForAllYears([]);
        //         setSeasonHitting({});
        //         setCareerHitting({});
        //     } else {
        //         teamColorBanners.eq(0).css('background-color', teamColor[0]);
        //         teamColorBanners.eq(1).css('background-color', teamColor[1]);

        //         allYearsSwitch.show();

        //         pitchingYearSelectDiv.html('<select id="player-stats-year-select"></select>');
        //         hittingYearSelectDiv.html('<select id="hitter-stats-year-select"></select>');

        //         var newStylesheet = $('<link>', {
        //             rel: 'stylesheet',
        //             href: 'https://unpkg.com/slim-select@latest/dist/slimselect.css'
        //         });

        //         $('head').append(newStylesheet);

        //         var pitcherYearDropdown = new SlimSelect({
        //             select: pitchingYearSelectDiv.find('select').get(0),
        //             settings: {
        //                 showSearch: false,
        //                 placeholderText: 'Year',
        //                 closeOnSelect: true,
        //                 allowDeselect: false,
        //             },
        //             events: {
        //                 afterChange: (newVal, oldVal) => {
        //                     console.log('pitching charts change');
        //                     destroyCharts();
        //                     var newYear = pitcherYearDropdown.getSelected()[0];
        //                     createPitchingCharts(newYear);
        //                     createGenericCharts(newYear);
        //                 }
        //             }
        //         });

        //         var hittingYearDropdown = new SlimSelect({
        //             select: hittingYearSelectDiv.find('select').get(0),
        //             settings: {
        //                 showSearch: false,
        //                 placeholderText: 'Year',
        //                 closeOnSelect: true,
        //                 allowDeselect: false,
        //             },
        //             events: {
        //                 afterChange: (newVal, oldVal) => {
        //                     console.log('hitting charts change');
        //                     destroyCharts();
        //                     var newYear = hittingYearDropdown.getSelected()[0];
        //                     createHittingCharts(newYear);
        //                     createGenericCharts(newYear);
        //                 }
        //             }
        //         });

        //         var statsURLs = [];
        //         const baseYear = 2025;
        //         for (let i = baseYear; i >= startYear; i--) {
        //             statsURLs.push(`https://statsapi.mlb.com/api/v1/people/${playerID}?hydrate=stats(group=[hitting,pitching],type=[season,seasonAdvanced,career,careerAdvanced],season=${i})`);
        //         }

        //         var promises = statsURLs.map(url =>
        //             fetch(url)
        //                 .then(response => {
        //                     return response.json();
        //                 })
        //                 .catch(error => console.error('Error fetching data:', error))
        //         );

        //         Promise.all(promises)
        //             .then(splitData => {
        //                 var combinedData = splitData.flat();

        //                 var seasonPitching;
        //                 var seasonPitchingForAllYears;
        //                 var careerPitching;

        //                 playerStats = combinedData[0];
        //                 playerStats = playerStats['people'][0];

        //                 playerStatsPhoto.html(`<img src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${playerID}/headshot/silo/current">`);

        //                 var playerName = `${playerStats['fullName']}`;
        //                 var playerNumber = '';
        //                 if ('primaryNumber' in playerStats) {
        //                     playerNumber = `&bull; #${playerStats['primaryNumber']}`;
        //                 }
        //                 playerName = `${playerStats['fullName']} ${playerNumber} &bull; <a href="https://www.mlb.com/player/${fixName(playerStats['fullName'])}-${playerID}" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF" style="vertical-align: middle; margin-bottom: 5px;"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg></a>`;
        //                 playerStatsLabel.html(playerName);

        //                 playerDetails.find('li:nth-child(1) span:nth-child(2)').html(playerStats['currentAge']);
        //                 playerDetails.find('li:nth-child(2) span:nth-child(2)').html(playerStats['primaryPosition']['abbreviation']);

        //                 if ('birthStateProvince' in playerStats) {
        //                     playerDetails.find('li:nth-child(3) span:nth-child(2)').html(`${playerStats['birthCity']}, ${playerStats['birthStateProvince']}`);
        //                 } else {
        //                     playerDetails.find('li:nth-child(3) span:nth-child(2)').html(`${playerStats['birthCity']}, ${playerStats['birthCountry']}`);
        //                 }

        //                 playerDetails.show();

        //                 var position = playerStats['primaryPosition']['name'];
        //                 setPlayerPosition(position);

        //                 console.log('playerStats');
        //                 console.log(playerStats);

        //                 var stats = playerStats['stats'];

        //                 if (stats === undefined) {
        //                     console.log('missingStatsDiv');
        //                     missingStatsDiv.show();
        //                 } else {
        //                     if (position == 'Pitcher') {
        //                         var seasonPitching = stats.find(item =>
        //                             item.type.displayName === 'season' &&
        //                             item.group.displayName === 'pitching'
        //                         );
        //                         var seasonAdvancedPitching = stats.find(item =>
        //                             item.type.displayName === 'seasonAdvanced' &&
        //                             item.group.displayName === 'pitching'
        //                         );
        //                         var careerPitching = stats.find(item =>
        //                             item.type.displayName === 'career' &&
        //                             item.group.displayName === 'pitching'
        //                         );
        //                         var careerAdvancedPitching = stats.find(item =>
        //                             item.type.displayName === 'careerAdvanced' &&
        //                             item.group.displayName === 'pitching'
        //                         );

        //                         var validYears = [];

        //                         var seasonPitchingForAllYears = [];
        //                         for (let i = 0; i < combinedData.length; i++) {
        //                             var playerStatsForYear = combinedData[i];
        //                             playerStatsForYear = playerStatsForYear['people'][0];

        //                             var statsForYear = playerStatsForYear['stats'];
        //                             var seasonPitchingForYear = statsForYear.find(item =>
        //                                 item.type.displayName === 'season' &&
        //                                 item.group.displayName === 'pitching'
        //                             );

        //                             if (seasonPitchingForYear != undefined) {
        //                                 seasonPitchingForAllYears.push(seasonPitchingForYear);

        //                                 validYears.push(seasonPitchingForYear['splits'][0]['season']);
        //                             }
        //                         }
        //                         setSeasonPitching(seasonPitching);
        //                         setSeasonPitchingForAllYears(seasonPitchingForAllYears);
        //                         setCareerPitching(careerPitching);

        //                         pitcherYearDropdown.setData(
        //                             validYears.map(year => ({
        //                                 text: year,
        //                                 value: year
        //                             }))
        //                         );

        //                         updatePitchingStatsTable(seasonPitching !== undefined
        //                             ? [seasonPitching, careerPitching]
        //                             : [careerPitching]);

        //                         pitchingStatsDiv.show();
        //                         hittingStatsDiv.hide();
        //                     } else {
        //                         var seasonHitting = stats.find(item =>
        //                             item.type.displayName === 'season' &&
        //                             item.group.displayName === 'hitting'
        //                         );
        //                         var seasonAdvancedHitting = stats.find(item =>
        //                             item.type.displayName === 'seasonAdvanced' &&
        //                             item.group.displayName === 'hitting'
        //                         );
        //                         var careerHitting = stats.find(item =>
        //                             item.type.displayName === 'career' &&
        //                             item.group.displayName === 'hitting'
        //                         );
        //                         var careerAdvancedHitting = stats.find(item =>
        //                             item.type.displayName === 'careerAdvanced' &&
        //                             item.group.displayName === 'hitting'
        //                         );

        //                         console.log('hitting');
        //                         console.log(seasonHitting);
        //                         console.log(seasonAdvancedHitting);
        //                         console.log(careerHitting);
        //                         console.log(careerAdvancedHitting);

        //                         var validYears = [];

        //                         var seasonHittingForAllYears = [];
        //                         for (let i = 0; i < combinedData.length; i++) {
        //                             var playerStatsForYear = combinedData[i];
        //                             playerStatsForYear = playerStatsForYear['people'][0];

        //                             var statsForYear = playerStatsForYear['stats'];
        //                             var seasonHittingForYear = statsForYear.find(item =>
        //                                 item.type.displayName === 'season' &&
        //                                 item.group.displayName === 'hitting'
        //                             );

        //                             if (seasonHittingForYear != undefined) {
        //                                 seasonHittingForAllYears.push(seasonHittingForYear);

        //                                 validYears.push(seasonHittingForYear['splits'][0]['season']);
        //                             }
        //                         }
        //                         setSeasonHitting(seasonHitting);
        //                         setSeasonHittingForAllYears(seasonHittingForAllYears);
        //                         setCareerHitting(careerHitting);

        //                         hittingYearDropdown.setData(
        //                             validYears.map(year => ({
        //                                 text: year,
        //                                 value: year
        //                             }))
        //                         );

        //                         console.log('updateHittingStatsTable');
        //                         updateHittingStatsTable(seasonHitting !== undefined
        //                             ? [seasonHitting, careerHitting]
        //                             : [careerHitting]);

        //                         // hittingStatsDT.clear();

        //                         // seasonHitting = seasonHitting['splits'][0];
        //                         // careerHitting = careerHitting['splits'][0];

        //                         // hittingStatsDT.row.add([
        //                         //     // `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[seasonHitting['team']['name']][0]}"><span>${seasonHitting['season']}</span>`,
        //                         //     `${seasonHitting['season']}`,
        //                         //     seasonHitting['stat']['atBats'],
        //                         //     seasonHitting['stat']['runs'],
        //                         //     seasonHitting['stat']['hits'],
        //                         //     seasonHitting['stat']['homeRuns'],
        //                         //     seasonHitting['stat']['rbi'],
        //                         //     seasonHitting['stat']['stolenBases'],
        //                         //     seasonHitting['stat']['avg'],
        //                         //     seasonHitting['stat']['obp'],
        //                         //     seasonHitting['stat']['slg'],
        //                         //     seasonHitting['stat']['ops']
        //                         // ]);

        //                         // hittingStatsDT.row.add([
        //                         //     'Career',
        //                         //     careerHitting['stat']['atBats'],
        //                         //     careerHitting['stat']['runs'],
        //                         //     careerHitting['stat']['hits'],
        //                         //     careerHitting['stat']['homeRuns'],
        //                         //     careerHitting['stat']['rbi'],
        //                         //     careerHitting['stat']['stolenBases'],
        //                         //     careerHitting['stat']['avg'],
        //                         //     careerHitting['stat']['obp'],
        //                         //     careerHitting['stat']['slg'],
        //                         //     careerHitting['stat']['ops']
        //                         // ]);

        //                         // update hit
        //                         // createHitsScatterPlot();

        //                         // hittingStatsDT.draw(true);

        //                         pitchingStatsDiv.hide();
        //                         hittingStatsDiv.show();
        //                     }

        //                     genericStatsDiv.show();
        //                     missingStatsDiv.hide();
        //                 }
        //             })
        //     }

        //     function createPitchingCharts(year) {
        //         fetch(`https://statsapi.mlb.com/api/v1/people/${playerID}?&hydrate=stats(group=[pitching],type=[pitchArsenal,gameLog,metricAverage],metrics=[releaseSpeed],limit=10000,season=${year})`)
        //             .then(response => {
        //                 if (!response.ok) {
        //                     throw new Error('Network response was not ok');
        //                 }
        //                 return response.json();
        //             })
        //             .then(data => {
        //                 var gameLog = data['people'][0]['stats'][1]['splits'];
        //                 var gameURLs = [];

        //                 pitchingGameLogDT.clear();
        //                 for (let i = 0; i < gameLog.length; i++) {
        //                     var date = gameLog[i]['date'];
        //                     var team = gameLog[i]['team']['name'];
        //                     var opponent = gameLog[i]['opponent']['name'];
        //                     var summary = gameLog[i]['stat']['summary'];
        //                     var pitches = gameLog[i]['stat']['numberOfPitches'];
        //                     var inningsPitched = gameLog[i]['stat']['inningsPitched'];
        //                     var er = gameLog[i]['stat']['earnedRuns'];
        //                     var era = gameLog[i]['stat']['era'];
        //                     var hits = gameLog[i]['stat']['hits'];
        //                     var strikeouts = gameLog[i]['stat']['strikeOuts'];
        //                     var walks = gameLog[i]['stat']['baseOnBalls'];
        //                     var whip = gameLog[i]['stat']['whip'];
        //                     var link = gameLog[i]['game']['link'];

        //                     date = `${date.split('-')[1]}/${date.split('-')[2]}`;

        //                     var teamWins = gameLog[i]['isWin'] ? 'winner' : '';
        //                     var opponentWins = gameLog[i]['isWin'] ? '' : 'winner';
        //                     team = `<img width="30" height="30" class="logo ${teamWins}" src="${Consts.teamInfo[team][0]}">`;
        //                     opponent = `<img width="30" height="30" class="logo ${opponentWins}" src="${Consts.teamInfo[opponent][0]}">`;
        //                     var vsOrAt = gameLog[i]['isHome'] ? '&nbsp;vs.&nbsp;' : '&nbsp;@&nbsp;&nbsp;';
        //                     var matchup = `${team}${vsOrAt}${opponent}`;

        //                     pitchingGameLogDT.row.add([
        //                         date,
        //                         matchup,
        //                         pitches,
        //                         inningsPitched,
        //                         er,
        //                         era,
        //                         hits,
        //                         strikeouts,
        //                         walks,
        //                         whip,
        //                         link
        //                     ]);

        //                     pitchingGameLogDT.draw(true);

        //                     gameURLs.push(`https://statsapi.mlb.com/${gameLog[i]['game']['link']}`);
        //                 }

        //                 pitchingGameLogDT.on('select', function (e, dt, type, indexes) {
        //                     var selectedIndex = indexes[0];
        //                     var gameLink = dt.row(selectedIndex).data()[10];

        //                     var link = `https://statsapi.mlb.com/${gameLink}`;
        //                     fetch(link)
        //                         .then(response => {
        //                             if (!response.ok) {
        //                                 throw new Error('Network response was not ok');
        //                             }
        //                             return response.json();
        //                         })
        //                         .then(gameResponse => {
        //                             gameDataToSend = gameResponse;
        //                             console.log(gameDataToSend);
        //                             setSelectedGame(gameDataToSend);
        //                             navigate('/games');
        //                         })
        //                 });

        //                 var promises = gameURLs.map(url =>
        //                     fetch(url)
        //                         .then(response => {
        //                             return response.json();
        //                         })
        //                         .catch(error => console.error('Error fetching data:', error))
        //                 );

        //                 Promise.all(promises)
        //                     .then(splitData => {
        //                         var combinedData = splitData.flat();

        //                         // bar chart
        //                         var allPlaysPitched = [];

        //                         // get all pitches from that pitcher
        //                         var allPitches = [];
        //                         for (let i = 0; i < combinedData.length; i++) {
        //                             var allPlays = combinedData[i]['liveData']['plays']['allPlays'];
        //                             for (let j = 0; j < allPlays.length; j++) {
        //                                 if (allPlays[j]['matchup']['pitcher']['id'] == playerID) {
        //                                     var playEvents = allPlays[j]['playEvents'];
        //                                     for (let k = 0; k < playEvents.length; k++) {
        //                                         if (playEvents[k]['isPitch']) {
        //                                             allPitches.push(playEvents[k]);
        //                                         }
        //                                     }

        //                                     allPlaysPitched.push(allPlays[j]);
        //                                 }
        //                             }
        //                         }
        //                         console.log(`allPitches: ${allPitches.length}`);

        //                         // pie chart
        //                         var counts = [];
        //                         var pitches = [];
        //                         var pitchCodes = [];

        //                         // scatter plot
        //                         var pitchDatasets = [];
        //                         var labels = [];

        //                         for (let i = 0; i < allPitches.length; i++) {
        //                             var pitchCode = null;
        //                             var pitchDescription = null;
        //                             try {
        //                                 pitchCode = allPitches[i]['details']['type']['code'];
        //                                 pitchDescription = allPitches[i]['details']['type']['description'];

        //                                 // console.log(pitchType);
        //                                 // if (pitchCode == 'FA') {
        //                                 //   pitchCode = 'FF';
        //                                 // }
        //                                 // if (pitchDescription == 'Fastball') {
        //                                 //   pitchDescription = 'Four-Seam Fastball';
        //                                 // }
        //                                 if (pitchCode != 'FA') {
        //                                     var dataPoint = {
        //                                         x: allPitches[i]['pitchData']['startSpeed'],
        //                                         y: 0.1 + (0.9 - 0.1) * Math.random()
        //                                     };
        //                                 }
        //                             } catch {
        //                                 // console.log('unknown pitch');
        //                                 // console.log(allPitches[i]);
        //                                 pitchCode = '?';
        //                                 pitchDescription = 'Unknown';
        //                             }
        //                             // console.log(allPitches[i]['details']);

        //                             if (pitchDescription != 'Unknown') {
        //                                 if (!(pitchDatasets.find(item => item.label == pitchDescription))) {
        //                                     // pie chart
        //                                     counts.push(1);
        //                                     pitches.push(pitchDescription);
        //                                     pitchCodes.push(pitchCode);

        //                                     pitchDatasets.push({
        //                                         data: [dataPoint],
        //                                         label: pitchDescription,
        //                                         pointBackgroundColor: pitchColors(pitchCode),
        //                                         pointBorderColor: 'rgba(0, 0, 0, 1)',
        //                                         pointRadius: 4,
        //                                         borderWidth: 1
        //                                     });
        //                                 } else {
        //                                     // pie chart
        //                                     var pitchIndex = pitchCodes.indexOf(pitchCode);
        //                                     counts[pitchIndex] += 1;

        //                                     // scatter plot
        //                                     var pitchDataset = pitchDatasets.find(item => item.label == pitchDescription);
        //                                     pitchDataset['data'].push(dataPoint);
        //                                 }
        //                             }
        //                         }

        //                         // pie chart
        //                         var combinedPitches = counts.map((counts, index) => ({
        //                             counts: counts,
        //                             pitches: pitches[index],
        //                             pitchCodes: pitchCodes[index]
        //                         }));

        //                         combinedPitches.sort((a, b) => b.counts - a.counts);
        //                         var sortedCounts = combinedPitches.map(item => item.counts);
        //                         var sortedPitches = combinedPitches.map(item => item.pitches);
        //                         var sortedPitchCodes = combinedPitches.map(item => item.pitchCodes);

        //                         // scatter plot
        //                         pitchDatasets.sort((a, b) => b.data.length - a.data.length);
        //                         for (let i = 0; i < pitchDatasets.length; i++) {
        //                             labels.push(pitchDatasets[i]['label']);
        //                         }

        //                         // var total = 0;
        //                         // for (let i = 0; i < pitchDatasets.length; i++) {
        //                         //     total += pitchDatasets[i]['data'].length;
        //                         // }

        //                         // bar chart
        //                         // console.log('allPlaysPitched');
        //                         // console.log(allPlaysPitched);
        //                         var inningsPitched = {};
        //                         for (let i = 1; i <= 9; i++) {
        //                             inningsPitched[i] = 0;
        //                         }
        //                         var newOuts = 0;
        //                         var currInning;
        //                         for (let i = 0; i < allPlaysPitched.length; i++) {
        //                             // console.log(allPlaysPitched[i]['about']['inning'], allPlaysPitched[i]['about']['hasOut'], allPlaysPitched[i]['count']['outs'], allPlaysPitched[i]);

        //                             currInning = allPlaysPitched[i]['about']['inning'];
        //                             newOuts = 0;

        //                             for (let j = 0; j < allPlaysPitched[i]['runners'].length; j++) {
        //                                 if (allPlaysPitched[i]['runners'][j]['movement']['isOut']) {
        //                                     newOuts += 1;
        //                                 }
        //                             }

        //                             if (newOuts > 0) {
        //                                 if (!(currInning in inningsPitched)) {
        //                                     inningsPitched[currInning] = newOuts;
        //                                 } else {
        //                                     inningsPitched[currInning] += newOuts;
        //                                     // console.log(`ip[${currInning}] = ${inningsPitched[currInning]}`);
        //                                 }
        //                                 // console.log(`adding: ${newOuts} outs`);
        //                             }
        //                         }

        //                         Object.keys(inningsPitched).forEach(inningNumber => {
        //                             inningsPitched[inningNumber] /= 3;
        //                         });

        //                         var totalIP = Object.values(inningsPitched).reduce((a, b) => a + b, 0);
        //                         totalIP = formatInnings(totalIP);

        //                         var backgroundColors = sortedPitchCodes.map(pitchColors);

        //                         pitchesPieChart = new Chart(pitchesPieChartCanvas, {
        //                             type: 'pie',
        //                             data: {
        //                                 labels: sortedPitches,
        //                                 datasets: [{
        //                                     data: sortedCounts,
        //                                     backgroundColor: backgroundColors
        //                                 }]
        //                             },
        //                             options: {
        //                                 layout: {
        //                                     padding: {
        //                                         bottom: 20
        //                                     }
        //                                 },
        //                                 plugins: {
        //                                     title: {
        //                                         display: true,
        //                                         text: 'Pitch Types',
        //                                         color: 'white',
        //                                         font: {
        //                                             size: 21
        //                                         }
        //                                     },
        //                                     legend: {
        //                                         labels: {
        //                                             color: 'white',
        //                                             font: {
        //                                                 size: 18
        //                                             }
        //                                         }
        //                                     }
        //                                 }
        //                             }
        //                         });

        //                         pitchesScatterPlot = new Chart(pitchesScatterPlotCanvas, {
        //                             type: 'scatter',
        //                             data: {
        //                                 labels: labels,
        //                                 datasets: pitchDatasets
        //                             },
        //                             options: {
        //                                 scales: {
        //                                     x: {
        //                                         min: 75,
        //                                         max: 100,
        //                                         border: {
        //                                             display: false
        //                                         },
        //                                         ticks: {
        //                                             color: 'white',
        //                                             font: {
        //                                                 size: 18
        //                                             }
        //                                         },
        //                                         grid: {
        //                                             color: 'white',
        //                                             z: 1
        //                                         }
        //                                     },
        //                                     y: {
        //                                         min: 0,
        //                                         max: 1,
        //                                         ticks: {
        //                                             display: false,
        //                                             stepSize: 1,
        //                                         },
        //                                         grid: {
        //                                             display: true,
        //                                             drawTicks: false,
        //                                             color: 'white'
        //                                         }
        //                                     }
        //                                 },
        //                                 plugins: {
        //                                     title: {
        //                                         display: true,
        //                                         text: 'All Pitches (mph)',
        //                                         color: 'white',
        //                                         font: {
        //                                             size: 21
        //                                         }
        //                                     },
        //                                     legend: {
        //                                         display: true,
        //                                         labels: {
        //                                             color: 'white',
        //                                             font: {
        //                                                 size: 18
        //                                             },
        //                                             generateLabels: chart => chart.data.labels.map((l, i) => ({
        //                                                 datasetIndex: i,
        //                                                 text: l,
        //                                                 fillStyle: chart.data.datasets[i].pointBackgroundColor,
        //                                                 fontColor: 'white',
        //                                                 strokeStyle: 'white',
        //                                                 lineWidth: 2,
        //                                                 hidden: chart.getDatasetMeta(i).hidden
        //                                             }))
        //                                         }
        //                                     },
        //                                     tooltip: {
        //                                         callbacks: {
        //                                             label: function (context) {
        //                                                 var label = context.dataset.label;
        //                                                 var speed = context.parsed.x;
        //                                                 return `${label}, ${speed} mph`;
        //                                             }
        //                                         }
        //                                     }
        //                                 }
        //                             }
        //                         });

        //                         fetch(`https://statsapi.mlb.com/api/v1/seasons/${year}?sportId=1`)
        //                             .then(response => {
        //                                 if (!response.ok) {
        //                                     throw new Error('Network response was not ok');
        //                                 }
        //                                 return response.json();
        //                             })
        //                             .then(seasonInfo => {
        //                                 var seasonEndDate = seasonInfo['seasons'][0]['regularSeasonEndDate'];

        //                                 var eraLineChartDataCumulative = [];
        //                                 var eraLineChartDataGame = [];

        //                                 for (var game of gameLog) {
        //                                     eraLineChartDataCumulative.push(
        //                                         { x: game['date'], y: game['stat']['era'] }
        //                                     )
        //                                 }

        //                                 eraLineChart = new Chart(eraLineChartCanvas, {
        //                                     type: 'line',
        //                                     data: {
        //                                         datasets: [
        //                                             {
        //                                                 label: 'ERA',
        //                                                 data: eraLineChartDataCumulative
        //                                             },
        //                                         ]
        //                                     },
        //                                     options: {
        //                                         layout: {
        //                                             padding: {
        //                                                 left: 15,
        //                                                 right: 30
        //                                             }
        //                                         },
        //                                         scales: {
        //                                             x: {
        //                                                 min: new Date(`${seasonInfo['seasons'][0]['regularSeasonStartDate']}T00:00:00`), // TODO: use months as ticks
        //                                                 max: seasonEndDate,
        //                                                 border: {
        //                                                     display: false
        //                                                 },
        //                                                 ticks: {
        //                                                     color: 'white',
        //                                                     font: {
        //                                                         size: 18
        //                                                     }
        //                                                 },
        //                                                 grid: {
        //                                                     color: 'white'
        //                                                 },
        //                                                 type: 'time',
        //                                                 time: {
        //                                                     unit: 'day'
        //                                                 }
        //                                             },
        //                                             y: {
        //                                                 title: {
        //                                                     display: true,
        //                                                     text: 'ERA',
        //                                                     color: 'white',
        //                                                     font: {
        //                                                         size: 18
        //                                                     }
        //                                                 },
        //                                                 border: {
        //                                                     display: false
        //                                                 },
        //                                                 ticks: {
        //                                                     display: true,
        //                                                     color: 'white',
        //                                                     font: {
        //                                                         size: 18
        //                                                     }
        //                                                 },
        //                                                 grid: {
        //                                                     display: false
        //                                                 }
        //                                             }
        //                                         },
        //                                         plugins: {
        //                                             title: {
        //                                                 display: true,
        //                                                 text: 'Cumulative ERA',
        //                                                 color: 'white',
        //                                                 font: {
        //                                                     size: 21
        //                                                 }
        //                                             },
        //                                             legend: {
        //                                                 display: false
        //                                             },
        //                                             tooltip: {
        //                                                 callbacks: {
        //                                                     title: function(context) {
        //                                                         return context[0]['label'].split(',').slice(0, 2).join(',');
        //                                                     }
        //                                                 },
        //                                                 mode: 'index',
        //                                                 intersect: false
        //                                             },
        //                                         }
        //                                     }
        //                                 });
        //                             })

        //                         inningsPitchedBarChart = new Chart(inningsPitchedBarChartCanvas, {
        //                             type: 'bar',
        //                             data: {
        //                                 labels: Object.keys(inningsPitched),
        //                                 datasets: [
        //                                     {
        //                                         data: Object.values(inningsPitched),
        //                                         backgroundColor: 'rgba(55, 160, 235, 1)',
        //                                         borderColor: 'white',
        //                                         borderWidth: 2,
        //                                     }
        //                                 ]
        //                             },
        //                             options: {
        //                                 layout: {
        //                                     padding: {
        //                                         left: 15,
        //                                         right: 30
        //                                     }
        //                                 },
        //                                 scales: {
        //                                     x: {
        //                                         title: {
        //                                             display: true,
        //                                             text: 'Inning Number',
        //                                             color: 'white',
        //                                             font: {
        //                                                 size: 18
        //                                             }
        //                                         },
        //                                         ticks: {
        //                                             display: true,
        //                                             color: 'white',
        //                                             font: {
        //                                                 size: 18
        //                                             },
        //                                         },
        //                                         grid: {
        //                                             display: false
        //                                         }
        //                                     },
        //                                     y: {
        //                                         title: {
        //                                             display: true,
        //                                             text: 'Innings Pitched',
        //                                             color: 'white',
        //                                             font: {
        //                                                 size: 18
        //                                             }
        //                                         },
        //                                         border: {
        //                                             display: false
        //                                         },
        //                                         ticks: {
        //                                             display: true,
        //                                             color: 'white',
        //                                             font: {
        //                                                 size: 18
        //                                             }
        //                                         },
        //                                         grid: {
        //                                             color: 'white'
        //                                         }
        //                                     }
        //                                 },
        //                                 plugins: {
        //                                     title: {
        //                                         display: true,
        //                                         text: `Innings Pitched Distribution (Total: ${totalIP})`,
        //                                         color: 'white',
        //                                         font: {
        //                                             size: 21
        //                                         }
        //                                     },
        //                                     legend: {
        //                                         display: false
        //                                     },
        //                                     tooltip: {
        //                                         callbacks: {
        //                                             label: function (context) {
        //                                                 return formatInnings(context.parsed.y);
        //                                             }
        //                                         },
        //                                         mode: 'index',
        //                                         intersect: false
        //                                     },
        //                                     hover: {
        //                                         mode: 'index',
        //                                         intersect: false
        //                                     }
        //                                 }
        //                             }
        //                         });

        //                         fillStrikeZones(allPitches, sortedPitches);
        //                     })
        //             })
        //     }

        //     function createHittingCharts(year) {
        //         fetch(`https://statsapi.mlb.com/api/v1/people/${playerID}?&hydrate=stats(group=[hitting],type=[season,seasonAdvanced,gameLog,sprayChart],season=${year})`)
        //             .then(response => {
        //                 if (!response.ok) {
        //                     throw new Error('Network response was not ok');
        //                 }
        //                 return response.json();
        //             })
        //             .then(data => {

        //                 var gameLog = data['people'][0]['stats'][2]['splits'];
        //                 var gameURLs = [];

        //                 hittingGameLogDT.clear();
        //                 for (let i = 0; i < gameLog.length; i++) {
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

        //                     date = `${date.split('-')[1]}/${date.split('-')[2]}`;

        //                     var teamWins = gameLog[i]['isWin'] ? 'winner' : '';
        //                     var opponentWins = gameLog[i]['isWin'] ? '' : 'winner';
        //                     team = `<img width="30" height="30" class="logo ${teamWins}" src="${Consts.teamInfo[team][0]}">`;
        //                     opponent = `<img width="30" height="30" class="logo ${opponentWins}" src="${Consts.teamInfo[opponent][0]}">`;
        //                     var vsOrAt = gameLog[i]['isHome'] ? '&nbsp;vs.&nbsp;' : '&nbsp;@&nbsp;&nbsp;';
        //                     var matchup = `${team}${vsOrAt}${opponent}`;

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
        //                     // summary, hits, runs, walks, strikeouts

        //                     hittingGameLogDT.draw(true);

        //                     gameURLs.push(`https://statsapi.mlb.com/${gameLog[i]['game']['link']}`);
        //                 }

        //                 hittingGameLogDT.on('select', function (e, dt, type, indexes) {
        //                     var selectedIndex = indexes[0];
        //                     var gameLink = dt.row(selectedIndex).data()[10];

        //                     var link = `https://statsapi.mlb.com/${gameLink}`;
        //                     fetch(link)
        //                         .then(response => {
        //                             if (!response.ok) {
        //                                 throw new Error('Network response was not ok');
        //                             }
        //                             return response.json();
        //                         })
        //                         .then(gameResponse => {
        //                             gameDataToSend = gameResponse;
        //                             console.log(gameDataToSend);
        //                             setSelectedGame(gameDataToSend);
        //                             navigate('/games');
        //                         })
        //                 });

        //                 var promises = gameURLs.map(url =>
        //                     fetch(url)
        //                         .then(response => {
        //                             return response.json();
        //                         })
        //                         .catch(error => console.error('Error fetching data:', error))
        //                 );

        //                 Promise.all(promises)
        //                     .then(splitData => {
        //                         fetch(`https://statsapi.mlb.com/api/v1/eventTypes`)
        //                             .then(response => {
        //                                 if (!response.ok) {
        //                                     throw new Error('Network response was not ok');
        //                                 }
        //                                 return response.json();
        //                             })
        //                             .then(eventTypes => {
        //                                 // console.log('eventTypes');
        //                                 // console.log(eventTypes);

        //                                 var combinedData = splitData.flat();

        //                                 console.log('allHits');
        //                                 var allHits = [];
        //                                 var allLastPlayEvents = [];
        //                                 for (let i = 0; i < combinedData.length; i++) {
        //                                     // console.log(combinedData[i]['gamePk']);
        //                                     var allPlays = combinedData[i]['liveData']['plays']['allPlays'];
        //                                     for (let j = 0; j < allPlays.length; j++) {
        //                                         if (allPlays[j]['matchup']['batter']['id'] == playerID && allPlays[j]['about']['isComplete']) {
        //                                             var playEvents = allPlays[j]['playEvents'];
        //                                             var lastPlayEvent = playEvents[playEvents.length - 1];


        //                                             if ('hitData' in lastPlayEvent) {
        //                                                 allHits.push(allPlays[j]);
        //                                                 allLastPlayEvents.push(lastPlayEvent);
        //                                             }

        //                                             // console.log(lastPlayEvent['details']['description']);
        //                                         }
        //                                     }
        //                                 }

        //                                 console.log(allHits.length);
        //                                 console.log(allLastPlayEvents.length);

        //                                 var allHitTypes = [];
        //                                 var allHitLocations = [];
        //                                 var hitDatasets = [];

        //                                 for (let i = 0; i < allHits.length; i++) {
        //                                     // if (allHits[i]['result']['event'] == 'Home Run') {

        //                                     var event = allHits[i]['result']['event'];
        //                                     var hitCoords = {
        //                                         x: allLastPlayEvents[i]['hitData']['coordinates']['coordX'],
        //                                         y: 250 - allLastPlayEvents[i]['hitData']['coordinates']['coordY']
        //                                     };

        //                                     allHitTypes.push(event);
        //                                     allHitLocations.push(hitCoords);

        //                                     if (!hitDatasets.find(item => item.label == event)) {
        //                                         hitDatasets.push({
        //                                             data: [hitCoords],
        //                                             label: event,
        //                                             pointBackgroundColor: hitColors(event),
        //                                             pointBorderColor: 'rgba(0, 0, 0, 1)',
        //                                             pointRadius: 4,
        //                                             borderWidth: 2
        //                                         });
        //                                     } else {
        //                                         var hitDataset = hitDatasets.find(item => item.label == event);
        //                                         hitDataset['data'].push(hitCoords);
        //                                     }

        //                                     // eventTypes

        //                                     // console.log([allLastPlayEvents[i]['hitData']['coordinates']['coordX'], allLastPlayEvents[i]['hitData']['coordinates']['coordY'], event]);
        //                                     // }
        //                                 }

        //                                 // flip y axis
        //                                 // add links add locations of hits
        //                                 // change background to gray
        //                                 // divs for team colors

        //                                 console.log('----');
        //                                 console.log(allHitLocations);
        //                                 console.log(allHits);
        //                                 console.log(allHitTypes);
        //                                 console.log(allHitLocations);
        //                                 console.log(hitDatasets);

        //                                 // var labels = [];

        //                                 // for (let i = 0; i < hitDatasets.length; i++) {
        //                                 //     labels.push(hitDatasets[i]['label']);
        //                                 // }


        //                                 // hitDatasets.push({
        //                                 //     data: allHitLocations,
        //                                 //     label: 'label',
        //                                 //     pointBackgroundColor: 'rgb(200, 0, 0, 1)',
        //                                 //     pointBorderColor: 'rgb(0, 0, 0, 1)',
        //                                 //     pointRadius: 4,
        //                                 //     borderWidth: 1
        //                                 // });

        //                                 // var hitLabels = [];
        //                                 // var hitDatasets = [];
        //                                 // var backgroundColors = [
        //                                 //     'rgb(50, 100, 200)',
        //                                 //     'rgb(200, 50, 200)',
        //                                 //     'rgb(50, 200, 100)',
        //                                 //     'rgb(200, 0, 50)'
        //                                 // ];

        //                                 // for (let i = 0; i < 4; i++) {
        //                                 //     hitLabels.push(`${i}`);

        //                                 //     hitDatasets.push({
        //                                 //         data: [
        //                                 //             {
        //                                 //                 x: 200 * Math.random(),
        //                                 //                 y: 200 * Math.random()
        //                                 //             },
        //                                 //             {
        //                                 //                 x: 200 * Math.random(),
        //                                 //                 y: 200 * Math.random()
        //                                 //             },
        //                                 //             {
        //                                 //                 x: 200 * Math.random(),
        //                                 //                 y: 200 * Math.random()
        //                                 //             }
        //                                 //         ],
        //                                 //         label: `${i}`,
        //                                 //         pointBackgroundColor: backgroundColors[i],
        //                                 //         pointBorderColor: 'rgb(0, 0, 0, 1)',
        //                                 //         pointRadius: 5,
        //                                 //         borderWidth: 0.5
        //                                 //     });
        //                                 // }

        //                                 // console.log('hits');
        //                                 // console.log(hitLabels);
        //                                 console.log('hitDatasets');
        //                                 console.log(hitDatasets);

        //                                 const allowedHits = ['Single', 'Double', 'Triple', 'Home Run'];
        //                                 const hitCounts = allHitTypes.reduce((acc, item) => {
        //                                     const key = allowedHits.includes(item) ? item : 'Out';
        //                                     acc[key] = (acc[key] || 0) + 1;
        //                                     return acc;
        //                                 }, {});
        //                                 console.log('counts');
        //                                 console.log(hitCounts);

        //                                 hitsPieChart = new Chart(hitsPieChartCanvas, {
        //                                     type: 'pie',
        //                                     // labels: ['Singles', 'Doubles', 'Triples', 'Home Runs'],
        //                                     data: {
        //                                         labels: ['Outs', 'Singles', 'Doubles', 'Triples', 'Home Runs'],
        //                                         datasets: [{
        //                                             data: [hitCounts['Out'], hitCounts['Single'], hitCounts['Double'], hitCounts['Triple'], hitCounts['Home Run']],
        //                                             // backgroundColor: [
        //                                                 // 'rgb(200, 200, 20)',
        //                                                 // 'rgb(20, 200, 200)',
        //                                                 // 'rgb(200, 100, 100)',
        //                                                 // 'rgb(50, 10, 200)',
        //                                             // ]
        //                                         }],
        //                                     },
        //                                     options: {
        //                                         layout: {
        //                                             padding: {
        //                                                 bottom: 20
        //                                             }
        //                                         },
        //                                         plugins: {
        //                                             title: {
        //                                                 display: true,
        //                                                 text: 'At bat results',
        //                                                 color: 'white',
        //                                                 font: {
        //                                                     size: 21
        //                                                 }
        //                                             },
        //                                             legend: {
        //                                                 labels: {
        //                                                     color: 'white',
        //                                                     font: {
        //                                                         size: 18
        //                                                     }
        //                                                 }
        //                                             }
        //                                         }
        //                                     }
        //                                 });

        //                                 hitsScatterPlot = new Chart(hitsScatterPlotCanvas, {
        //                                     type: 'scatter',
        //                                     data: {
        //                                         // datasets: [{
        //                                         //   pointRadius: 4,
        //                                         //   pointBackgroundColor: pitchColors,
        //                                         //   // label: pitchLabels,
        //                                         //   data: speeds
        //                                         // }]
        //                                         // labels: hitLabels,
        //                                         // labels: 'labels',
        //                                         datasets: hitDatasets
        //                                     },
        //                                     plugins: [{
        //                                         beforeDraw: chart => {
        //                                             var ctx = chart.ctx;
        //                                             ctx.save();
        //                                             const image = new Image();
        //                                             // image.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Stack_Overflow_logo.svg/2560px-Stack_Overflow_logo.svg.png';
        //                                             image.src = Consts.fieldBackground;
        //                                             //   image.src = 'baseball-field.png';
        //                                             ctx.drawImage(image, chart.chartArea.left, chart.chartArea.top, chart.chartArea.width, chart.chartArea.height);
        //                                             ctx.restore();
        //                                         }
        //                                     }],
        //                                     options: {
        //                                         aspectRatio: 1,
        //                                         scales: {
        //                                             x: {
        //                                                 min: 0,
        //                                                 max: 250,
        //                                                 ticks: {
        //                                                     color: 'white'
        //                                                 },
        //                                                 grid: {
        //                                                     display: false
        //                                                 }
        //                                             },
        //                                             y: {
        //                                                 min: 0,
        //                                                 max: 250,
        //                                                 ticks: {
        //                                                     color: 'white',
        //                                                     // reverse: true
        //                                                 },
        //                                                 grid: {
        //                                                     display: false
        //                                                 }
        //                                             },
        //                                         },
        //                                         plugins: {
        //                                             legend: {
        //                                                 display: true,
        //                                                 labels: {
        //                                                     color: 'white',
        //                                                     font: {
        //                                                         size: 18
        //                                                     },
        //                                                     // usePointStyle: true,
        //                                                     generateLabels: chart => chart.data.labels.map((l, i) => ({
        //                                                         // generateLabels: chart => chart.data.datasets.labels.slice(0, 2).map((l, i) => ({
        //                                                         datasetIndex: i,
        //                                                         text: l,
        //                                                         // fillStyle: chart.data.datasets[i].backgroundColor,
        //                                                         fillStyle: chart.data.datasets[i].pointBackgroundColor,
        //                                                         fontColor: 'white',
        //                                                         // strokeStyle: chart.data.datasets[i].backgroundColor,
        //                                                         strokeStyle: 'white',
        //                                                         lineWidth: 2,
        //                                                         hidden: chart.getDatasetMeta(i).hidden
        //                                                     }))
        //                                                 }
        //                                             },
        //                                             title: {
        //                                                 display: true,
        //                                                 text: 'Hit locations',
        //                                                 color: 'white',
        //                                                 font: {
        //                                                     size: 21
        //                                                 }
        //                                             },
        //                                         }
        //                                     }
        //                                 });
        //                             })
        //                     })
        //             })
        //     }

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
        //                                                                         }
        //                                                                     },
        //                                                                     plugins: {
        //                                                                         title: {
        //                                                                             display: true,
        //                                                                             text: 'Active Status',
        //                                                                             color: 'white',
        //                                                                             font: {
        //                                                                                 size: 21
        //                                                                             }
        //                                                                         },
        //                                                                         legend: {
        //                                                                             display: true,
        //                                                                             labels: {
        //                                                                                 color: 'white',
        //                                                                                 font: {
        //                                                                                     size: 18
        //                                                                                 },
        //                                                                                 generateLabels: function (chart) {
        //                                                                                     const datasets = chart.data.datasets;
        //                                                                                     return datasets.map(function (dataset, i) {
        //                                                                                         return {
        //                                                                                             datasetIndex: i,
        //                                                                                             text: dataset.label,
        //                                                                                             fillStyle: chart.data.datasets[i].backgroundColor,
        //                                                                                             fontColor: 'white',
        //                                                                                             strokeStyle: 'white',
        //                                                                                             lineWidth: 2,
        //                                                                                             hidden: chart.getDatasetMeta(i).hidden
        //                                                                                         };
        //                                                                                     });
        //                                                                                 }
        //                                                                                 // generateLabels: chart => chart.data.labels.map((l, i) => ({
        //                                                                                 //     datasetIndex: i,
        //                                                                                 //     text: l,
        //                                                                                 //     fillStyle: chart.data.datasets[i].backgroundColor,
        //                                                                                 //     fontColor: 'white',
        //                                                                                 //     strokeStyle: 'white',
        //                                                                                 //     lineWidth: 2,
        //                                                                                 //     hidden: chart.getDatasetMeta(i).hidden
        //                                                                                 // })) // TODO
        //                                                                             }
        //                                                                         },
        //                                                                         tooltip: {
        //                                                                             callbacks: {
        //                                                                                 title: function (context) {
        //                                                                                     var label = context[0]['dataset']['label'];
        //                                                                                     return label;
        //                                                                                 },
        //                                                                                 label: function (context) {
        //                                                                                     var dates = context['dataset']['data'][context['dataIndex']]['x'];
        //                                                                                     var startDate = new Date(dates[0]);
        //                                                                                     var endDate = new Date(dates[1]);

        //                                                                                     dateOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
        //                                                                                     var formattedStartDate = new Intl.DateTimeFormat('en-US', dateOptions).format(startDate);
        //                                                                                     var formattedEndDate = new Intl.DateTimeFormat('en-US', dateOptions).format(endDate);

        //                                                                                     if (context['label'] == 'Games') {
        //                                                                                         var gameDetails = gameLogInfo.find(game => game.date == new Intl.DateTimeFormat('en-CA', dateOptions).format(startDate));
        //                                                                                         updateGameLogSummary(playerID, gameDetails, formattedStartDate);
        //                                                                                         return formattedStartDate;
        //                                                                                     } else {
        //                                                                                         return `${formattedStartDate} - ${formattedEndDate}`;
        //                                                                                     }
        //                                                                                 }
        //                                                                             }
        //                                                                         }
        //                                                                     }
        //                                                                 },
        //                                                                 plugins: [
        //                                                                     {
        //                                                                         afterDraw: (chart) => {
        //                                                                             const { ctx, scales: { y } } = chart;
        //                                                                             const yTickCount = chart.data.labels.length;

        //                                                                             for (let i = 1; i < yTickCount; i++) {
        //                                                                                 const yPosition = y.getPixelForTick(i);
        //                                                                                 const xOffset = 40;
        //                                                                                 ctx.drawImage(teamLogos[i - 1], xOffset, yPosition - 25, 50, 50);
        //                                                                             }
        //                                                                         }
        //                                                                     }
        //                                                                 ]
        //                                                             })
        //                                                         });
        //                                                     })
        //                                             })
        //                                     })
        //                             })
        //                     })
        //             })

        //         updatePlayerAwards(playerID);
        //     }

        //     function fillStrikeZones(allPitches, sortedPitches) {
        //         var strikeZones = [];
        //         var strikeZonesHTML = '';

        //         var rowWidth = 5;
        //         var numberOfRows = Math.ceil(sortedPitches.length / rowWidth);

        //         for (let i = 0; i < numberOfRows; i++) {
        //             var temp1 = `scatter-row-${i}`;
        //             var temp2 = `label-row-${i}`;
        //             strikeZonesHTML += `
        //         <div class="strike-zone-scatter-plots">${temp1}</div>
        //         <div class="strike-zone-labels">${temp2}</div>
        //     `;
        //         }

        //         var scatterRowsHTML = new Array(numberOfRows).fill('');
        //         var labelRowsHTML = new Array(numberOfRows).fill('');

        //         for (let i = 0; i < sortedPitches.length; i++) {
        //             scatterRowsHTML[Math.floor(i / rowWidth)] += '<canvas width="200" height="300"></canvas>';
        //             labelRowsHTML[Math.floor(i / rowWidth)] += `<span>${sortedPitches[i]}</span>`;
        //         }

        //         for (let i = 0; i < numberOfRows; i++) {
        //             var temp = `scatter-row-${i}`;
        //             var pos = strikeZonesHTML.indexOf(temp);
        //             strikeZonesHTML = strikeZonesHTML.slice(0, pos) + scatterRowsHTML[i] + strikeZonesHTML.slice(pos + temp.length);

        //             temp = `label-row-${i}`;
        //             pos = strikeZonesHTML.indexOf(temp);
        //             strikeZonesHTML = strikeZonesHTML.slice(0, pos) + labelRowsHTML[i] + strikeZonesHTML.slice(pos + temp.length);
        //         }
        //         strikeZonesDiv.html(strikeZonesHTML);

        //         for (let i = 0; i < sortedPitches.length; i++) {
        //             strikeZones.push(strikeZonesDiv.find('canvas').get(i).getContext('2d'));
        //         }

        //         // var strikeZone = strikeZoneScatterPlotDiv.children().get(0).getContext('2d');
        //         // var strikeZone = strikeZoneScatterPlotCanvas[0].getContext('2d');

        //         const strikeZoneWidth = 200;
        //         const strikeZoneHeight = 300;

        //         var strikeZoneCenterX = strikeZoneWidth / 2;
        //         var strikeZoneCenterY = strikeZoneHeight / 2;
        //         var strikeZoneSide = 17 / 24;
        //         var sizeMult = 70; // 55

        //         // var strikeZoneTop = strikeZoneData[i][0][0];
        //         // var strikeZoneBottom = strikeZoneData[i][0][1];
        //         var strikeZoneTop = 3;
        //         var strikeZoneBottom = 1; // TODO
        //         var strikeZoneVertSize = strikeZoneTop - strikeZoneBottom;
        //         var strikeZoneCanvasLeft = strikeZoneCenterX - strikeZoneSide * sizeMult;
        //         var strikeZoneCanvasRight = strikeZoneCenterX + strikeZoneSide * sizeMult;
        //         var strikeZoneCanvasTop = strikeZoneCenterY - strikeZoneVertSize / 2 * sizeMult;
        //         var strikeZoneCanvasBottom = strikeZoneCenterY + strikeZoneVertSize / 2 * sizeMult;

        //         for (let i = 0; i < strikeZones.length; i++) {
        //             strikeZones[i].fillStyle = '#2c323a';
        //             strikeZones[i].fillRect(0, 0, strikeZoneWidth, strikeZoneHeight);

        //             strikeZones[i].strokeStyle = 'white';
        //             strikeZones[i].beginPath();

        //             strikeZones[i].moveTo(strikeZoneCanvasLeft, strikeZoneCanvasTop);
        //             strikeZones[i].lineTo(strikeZoneCanvasLeft, strikeZoneCanvasBottom);
        //             strikeZones[i].stroke();

        //             strikeZones[i].beginPath();
        //             strikeZones[i].moveTo(strikeZoneCanvasRight, strikeZoneCanvasTop);
        //             strikeZones[i].lineTo(strikeZoneCanvasRight, strikeZoneCanvasBottom);
        //             strikeZones[i].stroke();

        //             strikeZones[i].beginPath();
        //             strikeZones[i].moveTo(strikeZoneCanvasLeft, strikeZoneCanvasTop);
        //             strikeZones[i].lineTo(strikeZoneCanvasRight, strikeZoneCanvasTop);
        //             strikeZones[i].stroke();

        //             strikeZones[i].beginPath();
        //             strikeZones[i].moveTo(strikeZoneCanvasLeft, strikeZoneCanvasBottom);
        //             strikeZones[i].lineTo(strikeZoneCanvasRight, strikeZoneCanvasBottom);
        //             strikeZones[i].stroke();
        //         }

        //         var pitchesByType = [];
        //         for (let i = 0; i < sortedPitches.length; i++) {
        //             pitchesByType.push([]);
        //         }

        //         for (let i = 0; i < allPitches.length; i++) {
        //             if ('type' in allPitches[i]['details']) {
        //                 var pitchType = allPitches[i]['details']['type']['description'];
        //                 var index = sortedPitches.indexOf(pitchType);

        //                 if (index != -1) {
        //                     pitchesByType[index].push(allPitches[i]);
        //                 } else {
        //                     console.log(`UNKNOWN: ${pitchType}`);
        //                 }
        //             }
        //         }
        //         // console.log('pitchesByType');
        //         // console.log(pitchesByType);

        //         for (let i = 0; i < sortedPitches.length; i++) {
        //             // console.log(`=== i: ${i}, ${pitchesByType[i].length}`);
        //             for (let j = 0; j < pitchesByType[i].length; j++) {
        //                 var pitch = pitchesByType[i][j];
        //                 // console.log(j);
        //                 // console.log(pitch);

        //                 var pX = Math.round(pitch['pitchData']['coordinates']['pX'] * 1000) / 1000;
        //                 var pY = Math.round(pitch['pitchData']['coordinates']['pZ'] * 1000) / 1000;

        //                 var topY = strikeZoneCenterY - strikeZoneVertSize / 2 * sizeMult;
        //                 var bottomY = strikeZoneCenterY + strikeZoneVertSize / 2 * sizeMult;
        //                 var percentFromBottomY = (pY - strikeZoneBottom) / strikeZoneVertSize;

        //                 var pitchX = strikeZoneCenterX + pX * sizeMult;
        //                 var pitchY = bottomY - (percentFromBottomY * (bottomY - topY));

        //                 strikeZones[i].beginPath();
        //                 strikeZones[i].arc(pitchX, pitchY, 2, 0, 2 * Math.PI);
        //                 // strikeZone.fillStyle = 'rgba(0, 0, 255, 0.5)';
        //                 strikeZones[i].fillStyle = pitch['details']['ballColor']; // TODO
        //                 strikeZones[i].fill();
        //             }
        //         }

        //         // for (let i = 0; i < allPitches.length; i++) {
        //         //     var pitch = allPitches[i];

        //         //     var pX = Math.round(pitch['pitchData']['coordinates']['pX'] * 1000) / 1000;
        //         //     var pY = Math.round(pitch['pitchData']['coordinates']['pZ'] * 1000) / 1000;

        //         //     var topY = strikeZoneCenterY - strikeZoneVertSize / 2 * sizeMult;
        //         //     var bottomY = strikeZoneCenterY + strikeZoneVertSize / 2 * sizeMult;
        //         //     var percentFromBottomY = (pY - strikeZoneBottom) / strikeZoneVertSize;

        //         //     var pitchX = strikeZoneCenterX + pX * sizeMult;
        //         //     var pitchY = bottomY - (percentFromBottomY * (bottomY - topY));

        //         //     strikeZones[1].beginPath();
        //         //     strikeZones[1].arc(pitchX, pitchY, 2, 0, 2 * Math.PI);
        //         //     // strikeZone.fillStyle = 'rgba(0, 0, 255, 0.5)';
        //         //     strikeZones[1].fillStyle = pitch['details']['ballColor']; // TODO
        //         //     strikeZones[1].fill();
        //         // }


        //         // strikeZone.beginPath();
        //         // strikeZone.arc(100, 100, 8, 0, 2 * Math.PI);
        //         // strikeZone.fillStyle = 'red';
        //         // strikeZone.fill();
        //     }

        //     function updateGameLogSummary(playerID, gameDetails, gameDate) {
        //         var link = `https://statsapi.mlb.com${gameDetails['game']['link']}`;
        //         fetch(link)
        //             .then(response => {
        //                 if (!response.ok) {
        //                     throw new Error('Network response was not ok');
        //                 }
        //                 return response.json();
        //             })
        //             .then(gameResponse => {
        //                 gameDataToSend = gameResponse;

        //                 var awayTeam = gameResponse['gameData']['teams']['away']['name'];
        //                 var homeTeam = gameResponse['gameData']['teams']['home']['name'];

        //                 var awayTeamAbbr = gameResponse['gameData']['teams']['away']['abbreviation'];
        //                 var homeTeamAbbr = gameResponse['gameData']['teams']['home']['abbreviation'];

        //                 var awayTeamRuns = gameResponse['liveData']['linescore']['teams']['away']['runs'];
        //                 var homeTeamRuns = gameResponse['liveData']['linescore']['teams']['home']['runs'];

        //                 gameLogSummary.html(`<br>${gameDate}`);
        //                 gameLogDetails.html(`
        //             <table id="playerStatsGameLog">
        //                 <tr>
        //                     <td><img width="30" height="30" class="logo" src="${Consts.teamInfo[awayTeam][0]}">${awayTeamAbbr}</td>
        //                     <td>${awayTeamRuns}</td>
        //                 </tr>
        //                 <tr>
        //                     <td><img width="30" height="30" class="logo" src="${Consts.teamInfo[homeTeam][0]}">${homeTeamAbbr}</td>
        //                     <td>${homeTeamRuns}</td>
        //                 </tr>
        //             </table>
        //             <p>${gameDetails['player']['fullName']}</p>
        //             <p>${gameDetails['stat']['summary']}</p>
        //         `);

        //                 detailsButton.prop('disabled', false);
        //                 xButton.prop('disabled', false);
        //             })

        //         // gameLogDetails.html(`game details for ${playerID}`);
        //     }

        //     detailsButton.off('click').on('click', function () {
        //         // var gameDetailsEvent = new CustomEvent('gameDetailsEvent', { detail: gameDataToSend});
        //         // document.dispatchEvent(gameDetailsEvent);
        //         setSelectedGame(gameDataToSend);
        //         navigate('/games');
        //     });

        //     xButton.off('click').on('click', function () {
        //         gameLogSummary.html('');
        //         gameLogDetails.html('<br><br><br><br>');

        //         detailsButton.prop('disabled', true);
        //         xButton.prop('disabled', true);
        //     });
    }, [selectedPlayer]);

    // console.log('--------------------');
    // console.log(playerInfo);
    // console.log(selectedPlayer);
    // console.log(selectedTeam);

    // console.log(allYearsChecked);

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
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant='h5'>Pitch Arsenal (Total: {totalPitches})</Typography>
                                <PieChart responsive style={{ width: '600px', height: '600px' }}>
                                    <Pie
                                        data={pitcherYearDetails.pitchArsenal}
                                        dataKey='count'
                                        nameKey='pitchType'
                                        cx='50%'
                                        cy='50%'
                                        outerRadius={200}
                                        label={({ x, y, name, textAnchor, dominantBaseline }) => (
                                            <text
                                                x={x}
                                                y={y}
                                                fill='#ffffff'
                                                fontSize='20px'
                                                textAnchor={textAnchor}
                                                dominantBaseline={dominantBaseline}
                                            >
                                                {name}
                                            </text>
                                        )}
                                        labelLine={false}
                                    >
                                        {pitcherYearDetails.pitchArsenal.map((pitch, index) => {
                                            return <Cell key={`cell-${index}`} fill={(PITCH_COLORS[pitch.pitchType] !== undefined) ? PITCH_COLORS[pitch.pitchType] : 'rgba(150, 150, 150, 0.8)'} />
                                        })}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconSize={30} iconType='circle' wrapperStyle={{ fontSize: '20px' }} />
                                </PieChart>
                            </Box>
                        }
                        {pitcherYearDetails.pitchSpeeds &&
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant='h5'>Pitch Speeds</Typography>
                                <BarChart
                                    responsive
                                    style={{ width: '600px', height: '600px' }}
                                    data={pitcherYearDetails.pitchSpeeds}
                                >
                                    <CartesianGrid stroke='#ffffff' />
                                    <XAxis dataKey='pitchType' stroke='#ffffff' fontSize={14} />
                                    <YAxis stroke='#ffffff' domain={[60, 'auto']} fontSize={20} />
                                    <Tooltip
                                        formatter={(value) => [`${value} MPH average`]}
                                        contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '4px' }}
                                        itemStyle={{ color: '#fffff' }}
                                    />
                                    <Bar dataKey='speed' radius={[10, 10, 0, 0]}>
                                        {pitcherYearDetails.pitchSpeeds.map((pitch, index) => {
                                            return <Cell key={`cell-${index}`} fill={(PITCH_COLORS[pitch.pitchType] !== undefined) ? PITCH_COLORS[pitch.pitchType] : 'rgba(150, 150, 150, 0.8)'} />
                                        })}
                                    </Bar>
                                </BarChart>
                            </Box>
                        }
                    </Box>
                    {allSeasonPitches &&
                        <Box>
                            <Typography variant='h5'>All Pitches</Typography>
                            <ScatterChart
                                responsive
                                style={{ width: '1200px', height: '600px' }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <YAxis
                                    type="number"
                                    dataKey="yAxisTrack"
                                    stroke="#ffffff"
                                    domain={[-0.05, 1.05]}
                                    tick={false}
                                    tickLine={false}
                                    name=""
                                    show={false}
                                />
                                <XAxis
                                    type="number"
                                    dataKey="pitchData.startSpeed"
                                    name="Velocity"
                                    unit="MPH"
                                    stroke="#ffffff"
                                    domain={['dataMin - 2', 'dataMax + 2']}
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '5 5' }}
                                    shared={false}
                                    contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '4px' }}
                                    itemStyle={{ color: '#fff' }}
                                    content={<PitchTooltip />}
                                />
                                <Scatter
                                    data={allSeasonPitches.map(pitch => ({
                                        ...pitch,
                                        axisLine: "Velocity",
                                        yAxisTrack: Math.random()
                                    }))}
                                    isAnimationActive={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    onClick={handleScatterClick}
                                >
                                    {allSeasonPitches.map((entry, index) => (
                                        <Cell
                                            key={`pitch-${index}`}
                                            fill={PITCH_COLORS[entry.details?.type?.description] || '#555555'}
                                            opacity={0.5}
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </Box>}
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
                        <Box>
                            <Typography variant='h5'>Game Pitches</Typography>
                            <ScatterChart
                                responsive
                                style={{ width: '1200px', height: '600px' }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <YAxis
                                    type="number"
                                    dataKey="yAxisTrack"
                                    stroke="#ffffff"
                                    domain={[-0.05, 1.05]}
                                    tick={false}
                                    tickLine={false}
                                    name=""
                                    show={false}
                                />
                                <XAxis
                                    type="number"
                                    dataKey="pitchData.startSpeed"
                                    name="Velocity"
                                    unit="MPH"
                                    stroke="#ffffff"
                                    domain={['dataMin - 2', 'dataMax + 2']}
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '5 5' }}
                                    shared={false}
                                    contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '4px' }}
                                    itemStyle={{ color: '#fff' }}
                                    content={<PitchTooltip />}
                                />
                                <Scatter
                                    data={selectedPitcherGamePitches.map(pitch => ({
                                        ...pitch,
                                        axisLine: "Velocity",
                                        yAxisTrack: Math.random()
                                    }))}
                                    isAnimationActive={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    onClick={handleScatterClick}
                                >
                                    {selectedPitcherGamePitches.map((entry, index) => (
                                        <Cell
                                            key={`pitch-${index}`}
                                            fill={PITCH_COLORS[entry.details?.type?.description] || '#555555'}
                                            opacity={0.5}
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </Box>}
                    {
                        selectedPitcherGamePitchesVelocity &&
                        <Box>
                            <Typography variant='h5'>Game Pitches Velocity</Typography>
                            <ScatterChart
                                responsive
                                style={{ width: '1200px', height: '600px' }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <YAxis
                                    type="number"
                                    dataKey="velocity"
                                    unit="MPH"
                                    stroke="#ffffff"
                                    domain={['dataMin - 5', 'dataMax + 5']}
                                    // tick={false}
                                    fontSize={12}
                                    tickLine={false}
                                // show={false}
                                />
                                <XAxis
                                    type="number"
                                    dataKey="pitchTime"
                                    stroke="#ffffff"
                                    domain={[
                                        (dataMin) => dataMin - (5 * 60 * 1000),
                                        (dataMax) => dataMax + (5 * 60 * 1000)
                                    ]}
                                    fontSize={12}
                                    tickLine={false}
                                    tickFormatter={(ms) => {
                                        return new Date(ms).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        });
                                    }}
                                />
                                <Tooltip
                                    cursor={{ strokeDasharray: '5 5' }}
                                    shared={false}
                                    contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '4px' }}
                                    itemStyle={{ color: '#fff' }}
                                    content={<PitchTooltip />}
                                />
                                <Scatter
                                    data={selectedPitcherGamePitchesVelocity.map(pitch => ({
                                        ...pitch
                                    }))}
                                    isAnimationActive={false}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                    onClick={handleScatterClick}
                                >
                                    {selectedPitcherGamePitchesVelocity.map((entry, index) => (
                                        <Cell
                                            key={`pitch-${index}`}
                                            fill={PITCH_COLORS[entry.details?.type?.description] || '#555555'}
                                            opacity={0.5}
                                        />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </Box>
                    }
                    {/* <table id="pitching-stats">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Team</th>
                                <th><span className="tooltip" data-tooltip="Wins">W</span></th>
                                <th><span className="tooltip" data-tooltip="Losses">L</span></th>
                                <th><span className="tooltip" data-tooltip="Earned run average">ERA</span></th>
                                <th><span className="tooltip" data-tooltip="Games">G</span></th>
                                <th><span className="tooltip" data-tooltip="Games started">GS</span></th>
                                <th><span className="tooltip" data-tooltip="Saves">S</span></th>
                                <th><span className="tooltip" data-tooltip="Innings pitched">IP</span></th>
                                <th><span className="tooltip" data-tooltip="Strikeouts">SO</span></th>
                                <th><span className="tooltip" data-tooltip="Walks and hits per inning pitched">WHIP</span></th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table> */}
                </> : <>
                    <Typography variant="h6">hitter stats</Typography>
                </>
                }
                {/* <div id="pitching-stats-container">
                    <table id="pitching-stats">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Team</th>
                                <th><span className="tooltip" data-tooltip="Wins">W</span></th>
                                <th><span className="tooltip" data-tooltip="Losses">L</span></th>
                                <th><span className="tooltip" data-tooltip="Earned run average">ERA</span></th>
                                <th><span className="tooltip" data-tooltip="Games">G</span></th>
                                <th><span className="tooltip" data-tooltip="Games started">GS</span></th>
                                <th><span className="tooltip" data-tooltip="Saves">S</span></th>
                                <th><span className="tooltip" data-tooltip="Innings pitched">IP</span></th>
                                <th><span className="tooltip" data-tooltip="Strikeouts">SO</span></th>
                                <th><span className="tooltip" data-tooltip="Walks and hits per inning pitched">WHIP</span></th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    <div id="pitching-stats-year-select-container"></div>
                    <div id="pitches-pie-chart">
                        <canvas></canvas>
                    </div>
                    <div id="pitches-scatter-plot">
                        <canvas></canvas>
                    </div>
                    <div style={{ clear: 'both' }}></div>
                    <h2>Pitch Locations</h2>
                    <div id="strike-zones"></div>
                    <div id="era-line-chart">
                        <canvas></canvas>
                    </div>
                    <div id="innings-pitched-bar-chart">
                        <canvas></canvas>
                    </div>
                    <h2>Game Log</h2>
                    <table id="pitching-game-log">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Matchup</th>
                                <th>Pitches</th>
                                <th><span className="tooltip" data-tooltip="Innings pitched">IP</span></th>
                                <th><span className="tooltip" data-tooltip="Earned runs">ER</span></th>
                                <th><span className="tooltip" data-tooltip="Earned run average">ERA</span></th>
                                <th><span className="tooltip" data-tooltip="Hits">H</span></th>
                                <th><span className="tooltip" data-tooltip="Strikeouts">SO</span></th>
                                <th><span className="tooltip" data-tooltip="Walks">BB</span></th>
                                <th><span className="tooltip" data-tooltip="Walks and hits per inning pitched">WHIP</span></th>
                                <th>link</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div> */}
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
