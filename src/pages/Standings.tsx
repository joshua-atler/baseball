// @ts-nocheck

import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import {
    Box,
    Button,
    Typography,
    InputLabel,
    MenuItem,
    FormControl,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
    IconButton,
    Tabs,
    Tab
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import Grid from '@mui/material/Grid2';

import $ from 'jquery';
import '../styles/style.css';
import 'datatables.net-dt';
import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-select-dt';
import 'datatables.net-rowgroup';

import { Consts } from '../consts/consts.ts';


const divisionNames = ['AL East', 'NL East', 'AL Central', 'NL Central', 'AL West', 'NL West', 'AL', 'NL', 'Cactus League', 'Grapefruit League'];

function StandingsTable({ index }) {
    return (
        <table className="standings-dt">
            <thead>
                <tr>
                    <th>{divisionNames[index]}</th>
                    <th>W</th>
                    <th>L</th>
                    <th>GB</th>
                    <th>Home</th>
                    <th>Away</th>
                    <th>RS</th>
                    <th>RA</th>
                    <th>Streak</th>
                    <th>L10</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    )
}

export default function Standings() {
    const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);
    const [standingsYear, setStandingsYear] = React.useState(2026);
    const [standingsMode, setStandingsMode] = React.useState('regular season');
    const [leagueTab, setLeagueTab] = React.useState('AL');
    const tableIndices = leagueTab === 'AL' ? [0, 2, 4] : [1, 3, 5];

    const handleYearChange = (event: SelectChangeEvent) => {
        setStandingsYear(event.target.value as string);
    };

    const handleModeChange = (event: SelectChangeEvent) => {
        setStandingsMode(event.target.value as string);
    };

    const handleResize = () => {
        setScreenWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);

    const handleChange = (event, newValue) => {
        setLeagueTab(newValue);
    };

    React.useEffect(() => {

        var tables = document.querySelectorAll('.standings-dt');

        var dts = [];

        for (var table of tables) {
            if ($.fn.DataTable.isDataTable(table)) {
                dt = $(table).DataTable();
            } else {
                var dt = $(table).DataTable({
                    select: false,
                    dom: 'Bfrt',
                    searching: false,
                    ordering: false,
                    pageLength: 50
                })
            }
            dt.clear();
            dts.push(dt);
        }

        fetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${standingsYear}&standingsTypes=regularSeason&hydrate=team(league)`)
            .then(response => {
                return response.json();
            })
            .then(standingsData => {
                standingsData = standingsData['records'];

                var divisionsOrder = [201, 204, 202, 205, 200, 203];
                standingsData.sort((a, b) => divisionsOrder.indexOf(a['division']['id']) - divisionsOrder.indexOf(b['division']['id']));

                for (let i = 0; i < standingsData.length; i++) {
                    var records = standingsData[i]['teamRecords'];
                    for (let j = 0; j < records.length; j++) {
                        var record = records[j];

                        var teamName = record['team']['name'];
                        var wins = record['wins'];
                        var losses = record['losses'];
                        var gamesBack = record['gamesBack'];

                        var splitRecords = record['records']['splitRecords'];
                        var homeRecord = splitRecords.find(splitRecords => splitRecords.type === 'home');
                        var awayRecord = splitRecords.find(splitRecords => splitRecords.type === 'away');
                        var lastTen = splitRecords.find(splitRecords => splitRecords.type === 'lastTen');

                        homeRecord = `${homeRecord['wins']}-${homeRecord['losses']}`;
                        awayRecord = `${awayRecord['wins']}-${awayRecord['losses']}`;
                        lastTen = `${lastTen['wins']}-${lastTen['losses']}`;

                        var runsScored = record['runsScored'];
                        var runsAllowed = record['runsAllowed'];
                        var streak = '-';
                        if ('streak' in record) {
                            streak = record['streak']['streakCode'];
                        }

                        var clinched = '';
                        if ('clinchIndicator' in record) {
                            clinched = `-${record['clinchIndicator']}`;
                        }

                        teamName = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[teamName].logo}"><span>${teamName} ${clinched}</span>`;

                        dts[i].row.add([teamName, wins, losses, gamesBack, homeRecord, awayRecord, runsScored, runsAllowed, streak, lastTen]);
                    }
                    dts[i].draw(true);
                }
            })
            .catch(error => { });

        // wild card


        // spring training
        fetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${standingsYear}&standingsTypes=springTraining&hydrate=team(league)`)
            .then(response => {
                return response.json();
            })
            .then(standingsData => {
                standingsData = standingsData['records'];

                var allTeamsStandings = standingsData.flatMap(obj => obj.teamRecords);

                var cactusLeague = allTeamsStandings.filter(team => team.team.springLeague.id === 114);
                var grapefruitLeague = allTeamsStandings.filter(team => team.team.springLeague.id === 115);

                var cactusLeague = cactusLeague.sort((a, b) => Number(a.springLeagueRank) - Number(b.springLeagueRank));
                var grapefruitLeague = grapefruitLeague.sort((a, b) => Number(a.springLeagueRank) - Number(b.springLeagueRank));

                var springLeagues = [cactusLeague, grapefruitLeague];

                for (let i = 8; i < springLeagues.length + 8; i++) {
                    var records = springLeagues[i - 8];

                    for (let j = 0; j < records.length; j++) {
                        var record = records[j];

                        var teamName = record['team']['name'];
                        var wins = record['wins'];
                        var losses = record['losses'];
                        var gamesBack = record['springLeagueGamesBack'];

                        var splitRecords = record['records']['splitRecords'];
                        var homeRecord = splitRecords.find(splitRecords => splitRecords.type === 'home');
                        var awayRecord = splitRecords.find(splitRecords => splitRecords.type === 'away');
                        var lastTen = splitRecords.find(splitRecords => splitRecords.type === 'lastTen');

                        homeRecord = `${homeRecord['wins']}-${homeRecord['losses']}`;
                        awayRecord = `${awayRecord['wins']}-${awayRecord['losses']}`;
                        lastTen = `${lastTen['wins']}-${lastTen['losses']}`;

                        var runsScored = record['runsScored'];
                        var runsAllowed = record['runsAllowed'];
                        var streak = '-';
                        if ('streak' in record) {
                            streak = record['streak']['streakCode'];
                        }

                        teamName = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[teamName].logo}"><span>${teamName}</span>`;


                        dts[i].row.add([teamName, wins, losses, gamesBack, homeRecord, awayRecord, runsScored, runsAllowed, streak, lastTen]);
                    }
                    dts[i].draw(true);
                }
            })
            .catch(error => { });

    }, [standingsYear, screenWidth]);

    return (
        <Box>
            <Grid container spacing={2} id="standings-grid" alignItems="center" mt={2} ml={2} mb={3}>
                <Grid item>
                    <Typography variant="h6" noWrap component="div">
                        Year
                    </Typography>
                </Grid>
                <Grid item>
                    <Box sx={{ minWidth: 120, width: 200 }}>
                        <FormControl fullWidth>
                            <Select defaultValue={30} displayEmpty
                                id="todo"
                                value={standingsYear}
                                onChange={handleYearChange}
                            >
                                <MenuItem value={2026}>2026</MenuItem>
                                <MenuItem value={2025}>2025</MenuItem>
                                <MenuItem value={2024}>2024</MenuItem>
                                <MenuItem value={2023}>2023</MenuItem>
                                <MenuItem value={2022}>2022</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
                <Grid item>
                    <ToggleButtonGroup
                        color="primary"
                        value={standingsMode}
                        exclusive
                        onChange={handleModeChange}
                        aria-label="Platform"
                    >
                        <ToggleButton value="regular season">Regular Season</ToggleButton>
                        <ToggleButton value="wild card">Wild Card</ToggleButton>
                        <ToggleButton value="spring training">Spring Training</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
                <Grid item>
                    <Tooltip
                        title={
                            <Typography variant="body1" sx={{ fontSize: "1rem" }}>
                                x- Clinched Playoff Spot<br />
                                y- Clinched Division<br />
                                z- Clinched Best Record
                            </Typography>
                        }
                    >
                        <IconButton>
                            <InfoIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
            <div style={{ display: standingsMode === 'regular season' ? 'block' : 'none' }}>
                {screenWidth < 2400 ? (
                    <>
                        <Tabs value={leagueTab} onChange={handleChange} sx={{ mb: 4.5 }}>
                            <Tab label="AL" value={'AL'} />
                            <Tab label="NL" value={'NL'} />
                        </Tabs>
                        <Grid container spacing={0} alignItems="center" sx={{ width: 1200 }}>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Grid key={index}>
                                    <Box sx={{ width: 1200 }}
                                        hidden={(leagueTab === "AL" && [1, 3, 5].includes(index)) || (leagueTab === "NL" && [0, 2, 4].includes(index))}
                                    >
                                        <StandingsTable index={index} />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                ) : (
                    <>
                        <Grid container spacing={2} alignItems="center" sx={{ width: 2500 }}>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Grid key={index}>
                                    <Box sx={{ width: 1200 }}>
                                        <StandingsTable index={index} />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
            </div>
            <div style={{ display: standingsMode === 'wild card' ? 'block' : 'none' }}>
                {Array.from({ length: 2 }).map((_, index) => (
                    <Grid key={index + 6}>
                        <Box sx={{ width: 1200 }}>
                            <StandingsTable index={index + 6} />
                        </Box>
                    </Grid>
                ))}
            </div>
            <div style={{ display: standingsMode === 'spring training' ? 'block' : 'none' }}>
                {screenWidth < 2400 ? (
                    <>
                        {Array.from({ length: 2 }).map((_, index) => (
                            <Grid key={index + 8}>
                                <Box sx={{ width: 1200 }}>
                                    <StandingsTable index={index + 8} />
                                </Box>
                            </Grid>
                        ))}
                    </>
                ) : (
                    <>
                        <Grid container spacing={2} alignItems="center" sx={{ width: 2500 }}>
                            {Array.from({ length: 2 }).map((_, index) => (
                                <Grid key={index + 8}>
                                    <Box sx={{ width: 1200 }}>
                                        <StandingsTable index={index + 8} />
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}

            </div>
        </Box>
    );
}
