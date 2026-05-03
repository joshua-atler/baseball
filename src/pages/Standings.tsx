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
import { fetchStandings, fetchSeason } from '../services/standingsService.ts';
import { transformStandings } from '../utils/standingsTransformers.ts';
import { LoadingCircle } from '../components/LoadingCircle.tsx';
import { Visibility } from '@mui/icons-material';


// const divisionNames = ['AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West', 'AL', 'NL', 'Cactus League', 'Grapefruit League'];

function StandingsTable({ tableData, index }) {
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
        {
            data: 'records', title: 'Home',
            render: function (data) {
                const home = data?.splitRecords?.find(record => record.type === 'home');
                const homeRecord = `${home?.wins}-${home?.losses}`;
                return homeRecord;
            }
        },
        {
            data: 'records', title: 'Away',
            render: function (data) {
                const away = data?.splitRecords?.find(record => record.type === 'away');
                const awayRecord = `${away?.wins}-${away?.losses}`;
                return awayRecord;
            }
        },
        { data: 'runsScored', title: 'RS' },
        { data: 'runsAllowed', title: 'RA' },
        { data: 'streak.streakCode', title: 'Streak' },
        {
            data: 'records', title: 'L10',
            render: function (data) {
                const lastTen = data?.splitRecords?.find(record => record.type === 'lastTen');
                const lastTenRecord = `${lastTen?.wins}-${lastTen?.losses}`;
                return lastTenRecord;
            }
        },
    ];

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

        <DataTable
            data={tableData?.teamRecords}
            columns={columns}
            options={{
                searching: false,
                paging: false,
                info: false,
                ordering: false,
                dom: "t"
            }}>
        </DataTable>
    )
}

export default function Standings() {
    const [standingsYear, setStandingsYear] = useState(Temporal.Now.plainDateISO().year);
    const isCurrentYear = standingsYear === Temporal.Now.plainDateISO().year;
    const [standingsMode, setStandingsMode] = useState('regular season');
    const [leagueTab, setLeagueTab] = useState('AL');
    const firstYear = 2000;

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

            const today = Temporal.Now.plainDateISO();
            let year = standingsYear;
            let month = 0;
            let day = 0;
            if (isCurrentYear) {
                month = today.month;
                day = today.day;
            } else {
                const seasonInfo = await fetchSeason(year);
                const regularSeasonEndDate = seasonInfo?.seasons[0].regularSeasonEndDate;
                month = regularSeasonEndDate.split('-')[1];
                day = regularSeasonEndDate.split('-')[2];
            }

            try {
                const standings = await fetchStandings(month, day, year);
                const formattedStandings = await transformStandings(standings);
                setStandings(formattedStandings);
            } catch (error) {
                setStandings(null);
            }
        }

        getStandings();

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

    return (
        <Box>
            <Grid container spacing={2} alignItems="center" mt={2} ml={2} mb={3}>
                <Grid size="auto">
                    <Typography variant="h6">
                        Year
                    </Typography>
                </Grid>
                <Grid size="auto">
                    <Box sx={{ minWidth: 120, width: 200 }}>
                        <FormControl fullWidth>
                            <Select displayEmpty
                                value={standingsYear}
                                onChange={handleYearChange}
                            >
                                {Array.from({ length: Temporal.Now.plainDateISO().year - firstYear + 1}).map((_, i) => {
                                    const year = Temporal.Now.plainDateISO().year - i;
                                    return <MenuItem key={year} value={year}>{year}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
                <Grid size="auto">
                    <Box>
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
                    </Box>
                </Grid>
                <Grid size="auto">
                    <Tooltip
                        title={
                            <Typography variant="body1" sx={{ fontSize: "1rem" }}>
                                x- Clinched Playoff Spot<br />
                                y- Clinched Division<br />
                                z- Clinched Best Record
                            </Typography>
                        }
                    >
                        <span>
                            <IconButton>
                                <InfoIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
            </Grid>
            <div style={{ display: standingsMode === 'regular season' ? 'block' : 'none' }}>
                <Tabs value={leagueTab} onChange={handleChange} sx={{ mb: 4.5 }}>
                    <Tab label="AL" value={'AL'} />
                    <Tab label="NL" value={'NL'} />
                </Tabs>
                {standings ?
                    <Stack spacing={0} sx={{ width: '1500px' }}>
                        {standings.map((divisionData, index) => {
                            const isVisible = divisionData.division.includes(leagueTab);
                            return isVisible && <StandingsTable key={divisionData.division || index} tableData={divisionData} index={index} />
                        })}
                    </Stack> : <>
                        <LoadingCircle size={60} />
                    </>}
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
