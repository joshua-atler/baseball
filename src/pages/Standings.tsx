// @ts-nocheck

import { useState, useEffect } from 'react';
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
    Tab,
    Stack
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import Grid from '@mui/material/Grid2';

import $ from 'jquery';
import '../styles/style.css';
import 'datatables.net-dt';
import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-select-dt';
import 'datatables.net-rowgroup';

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-select-dt';

DataTable.use(DT);

import { Consts } from '../consts/consts.ts';
import { fetchStandings } from '../services/standingsService.ts';
import { transformStandings } from '../utils/standingsTransformers.ts';


// const divisionNames = ['AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West', 'AL', 'NL', 'Cactus League', 'Grapefruit League'];

function StandingsTable({ tableData, index }) { // table data
    const columns = [
        {
            data: 'team', title: `${tableData?.division}`, width: '20%',
            render: function (data) {
                return `<img src=${data.teamLogo} style="width: 30px; height: 30px; margin-right: 5px; vertical-align: middle" /><span>${data.name}</span>`
            }
        },
        { data: 'wins', title: 'W' },
        { data: 'losses', title: 'L' },
        { data: 'gamesBack', title: 'GB' },
        // { data: 'homeRecord', title: 'Home' },
        // { data: 'awayRecord', title: 'Away' },
        // { data: 'runsScored', title: 'RS' }, // tooltip
        // { data: 'runsAllowed', title: 'RA' }, // tooltip
        { data: 'streak.streakCode', title: 'Streak' },
        { data: 'records', title: 'L10',
            render: function (data) {
                console.log(data?.splitRecords?.filter(record => record.type === 'lastTen'));
                const lastTen = data?.splitRecords?.find(record => record.type === 'lastTen');
                console.log(lastTen);
                // return 'a';
            }},
    ];

    console.log('tableData');
    console.log(tableData);

    // const tableData = [
    //     {
    //         team: 'abc',
    //         wins: 10,
    //         losses: 20,
    //         gamesBack: 3,
    //         homeRecord: 4,
    //         awayRecord: 6,
    //         runsScored: 20,
    //         runsAllowed: 10,
    //         streak: 10,
    //         last10: 2
    //     }
    // ];

    return (
        // <table className="standings-dt">
        //     <thead>
        //         <tr>
        //             <th>{divisionNames[index]}</th>
        //             <th>W</th>
        //             <th>L</th>
        //             <th>GB</th>
        //             <th>Home</th>
        //             <th>Away</th>
        //             <th>RS</th>
        //             <th>RA</th>
        //             <th>Streak</th>
        //             <th>L10</th>
        //         </tr>
        //     </thead>
        //     <tbody>
        //     </tbody>
        // </table>

        <DataTable
            data={tableData?.teamRecords}
            columns={columns}
            options={{
                searching: false,
                paging: false,
                info: false,
                ordering: false,
                select: {
                    info: false
                },
                dom: "t",
                // autoWidth: false,
                // width: "100%"
            }}
        />
    )
}

export default function Standings() {
    const [standingsYear, setStandingsYear] = useState(Temporal.Now.plainDateISO().year);
    const isCurrentYear = standingsYear === Temporal.Now.plainDateISO().year;
    const [standingsMode, setStandingsMode] = useState('regular season');
    const [leagueTab, setLeagueTab] = useState('AL');
    const tableIndices = leagueTab === 'AL' ? [0, 1, 2] : [3, 4, 5];

    const [standings, setStandings] = useState(null);

    const handleYearChange = (event: SelectChangeEvent) => {
        setStandingsYear(event.target.value as string);
    };

    const handleModeChange = (event: SelectChangeEvent) => {
        setStandingsMode(event.target.value as string);
    };

    const handleChange = (event, newValue) => {
        setLeagueTab(newValue);
    };

    useEffect(() => {
        const getStandings = async () => {
            console.log(`standingsYear: ${standingsYear}`);
            console.log(`isCurrentYear: ${isCurrentYear}`);

            const today = Temporal.Now.plainDateISO();
            let year = standingsYear;
            let month = 0;
            let day = 0;
            if (isCurrentYear) {
                console.log('isCurrentYear');
                month = today.month;
                day = today.day;
            } else {
                console.log('is not current year');
                month = 10;
                day = 31;
            }

            try {
                const standings = await fetchStandings(month, day, year);
                const formattedStandings = await transformStandings(standings);
                setStandings(formattedStandings);
            } catch (error) {
                console.error("Team stats fetch failed: ", error);
                setStandings(null);
            }
        }

        getStandings();


        // fetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${standingsYear}&standingsTypes=regularSeason&hydrate=team(league)`)
        //     .then(response => {
        //         return response.json();
        //     })
        //     .then(standingsData => {
        //         standingsData = standingsData['records'];

        //         var divisionsOrder = [201, 204, 202, 205, 200, 203];
        //         standingsData.sort((a, b) => divisionsOrder.indexOf(a['division']['id']) - divisionsOrder.indexOf(b['division']['id']));

        //         for (let i = 0; i < standingsData.length; i++) {
        //             var records = standingsData[i]['teamRecords'];
        //             for (let j = 0; j < records.length; j++) {
        //                 var record = records[j];

        //                 var teamName = record['team']['name'];
        //                 var wins = record['wins'];
        //                 var losses = record['losses'];
        //                 var gamesBack = record['gamesBack'];

        //                 var splitRecords = record['records']['splitRecords'];
        //                 var homeRecord = splitRecords.find(splitRecords => splitRecords.type === 'home');
        //                 var awayRecord = splitRecords.find(splitRecords => splitRecords.type === 'away');
        //                 var lastTen = splitRecords.find(splitRecords => splitRecords.type === 'lastTen');

        //                 homeRecord = `${homeRecord['wins']}-${homeRecord['losses']}`;
        //                 awayRecord = `${awayRecord['wins']}-${awayRecord['losses']}`;
        //                 lastTen = `${lastTen['wins']}-${lastTen['losses']}`;

        //                 var runsScored = record['runsScored'];
        //                 var runsAllowed = record['runsAllowed'];
        //                 var streak = '-';
        //                 if ('streak' in record) {
        //                     streak = record['streak']['streakCode'];
        //                 }

        //                 var clinched = '';
        //                 if ('clinchIndicator' in record) {
        //                     clinched = `-${record['clinchIndicator']}`;
        //                 }

        //                 teamName = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[teamName].logo}"><span>${teamName} ${clinched}</span>`;

        //                 dts[i].row.add([teamName, wins, losses, gamesBack, homeRecord, awayRecord, runsScored, runsAllowed, streak, lastTen]);
        //             }
        //             dts[i].draw(true);
        //         }
        //     })
        //     .catch(error => { });

        // // wild card



        // // spring training
        // fetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${standingsYear}&standingsTypes=springTraining&hydrate=team(league)`)
        //     .then(response => {
        //         return response.json();
        //     })
        //     .then(standingsData => {
        //         standingsData = standingsData['records'];

        //         var allTeamsStandings = standingsData.flatMap(obj => obj.teamRecords);

        //         var cactusLeague = allTeamsStandings.filter(team => team.team.springLeague.id === 114);
        //         var grapefruitLeague = allTeamsStandings.filter(team => team.team.springLeague.id === 115);

        //         var cactusLeague = cactusLeague.sort((a, b) => Number(a.springLeagueRank) - Number(b.springLeagueRank));
        //         var grapefruitLeague = grapefruitLeague.sort((a, b) => Number(a.springLeagueRank) - Number(b.springLeagueRank));

        //         var springLeagues = [cactusLeague, grapefruitLeague];

        //         for (let i = 8; i < springLeagues.length + 8; i++) {
        //             var records = springLeagues[i - 8];

        //             for (let j = 0; j < records.length; j++) {
        //                 var record = records[j];

        //                 var teamName = record['team']['name'];
        //                 var wins = record['wins'];
        //                 var losses = record['losses'];
        //                 var gamesBack = record['springLeagueGamesBack'];

        //                 var splitRecords = record['records']['splitRecords'];
        //                 var homeRecord = splitRecords.find(splitRecords => splitRecords.type === 'home');
        //                 var awayRecord = splitRecords.find(splitRecords => splitRecords.type === 'away');
        //                 var lastTen = splitRecords.find(splitRecords => splitRecords.type === 'lastTen');

        //                 homeRecord = `${homeRecord['wins']}-${homeRecord['losses']}`;
        //                 awayRecord = `${awayRecord['wins']}-${awayRecord['losses']}`;
        //                 lastTen = `${lastTen['wins']}-${lastTen['losses']}`;

        //                 var runsScored = record['runsScored'];
        //                 var runsAllowed = record['runsAllowed'];
        //                 var streak = '-';
        //                 if ('streak' in record) {
        //                     streak = record['streak']['streakCode'];
        //                 }

        //                 teamName = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[teamName].logo}"><span>${teamName}</span>`;

        //                 dts[i].row.add([teamName, wins, losses, gamesBack, homeRecord, awayRecord, runsScored, runsAllowed, streak, lastTen]);
        //             }
        //             dts[i].draw(true);
        //         }
        //     })
        //     .catch(error => { });
    }, [standingsYear]);

    console.log('standings');
    console.log(standings);
    console.log(Array.isArray(standings));

    return (
        <Box>
            <Grid container spacing={2} id="standings-grid" alignItems="center" mt={2} ml={2} mb={3}>
                <Grid>
                    <Typography variant="h6" noWrap component="div">
                        Year
                    </Typography>
                </Grid>
                <Grid>
                    <Box sx={{ minWidth: 120, width: 200 }}>
                        <FormControl fullWidth>
                            <Select defaultValue={30} displayEmpty
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
                <Grid>
                    <ToggleButtonGroup
                        color="primary"
                        value={standingsMode}
                        exclusive
                        onChange={handleModeChange}
                    >
                        <ToggleButton value="regular season">Regular Season</ToggleButton>
                        <ToggleButton value="wild card">Wild Card</ToggleButton>
                        <ToggleButton value="spring training">Spring Training</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
                <Grid>
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
                <>
                    <Tabs value={leagueTab} onChange={handleChange} sx={{ mb: 4.5 }}>
                        <Tab label="AL" value={'AL'} />
                        <Tab label="NL" value={'NL'} />
                    </Tabs>
                    {standings ? <>
                        <Stack container spacing={0} alignItems="center" sx={{ width: '1200px' }}>
                            {standings.map((divisionData, index) => (
                                <Box key={divisionData.division || index} sx={{ width: '100%', mb: 4 }}>
                                    <StandingsTable tableData={divisionData} index={index} style={{ width: '1200px' }} />
                                </Box>
                            ))}
                        </Stack>
                    </> : <>
                        <Typography>LOADING</Typography>
                        {/* TODO: add loading icon */}
                    </>}
                </>
            </div>
            {/* <div style={{ display: standingsMode === 'wild card' ? 'block' : 'none' }}>
                {Array.from({ length: 2 }).map((_, index) => (
                    <Grid key={index + 6}>
                        <Box sx={{ width: 1200 }}>
                            <StandingsTable index={index + 6} />
                        </Box>
                    </Grid>
                ))}
            </div>
            <div style={{ display: standingsMode === 'spring training' ? 'block' : 'none' }}>
                <>
                    {Array.from({ length: 2 }).map((_, index) => (
                        <Grid key={index + 8}>
                            <Box sx={{ width: 1200 }}>
                                <StandingsTable index={index + 8} />
                            </Box>
                        </Grid>
                    ))}
                </>
            </div> */}
        </Box>
    );
}
