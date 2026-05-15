// @ts-nocheck

import { useState, useEffect, useMemo } from 'react';
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
    Stack,
    Slider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import Grid from '@mui/material/Grid2';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
// import { RechartsDevtools } from '@recharts/devtools';
import { useTheme } from '@mui/material/styles';


// import $ from 'jquery';
import '../styles/style.css';
// import 'datatables.net-dt';
// import 'datatables.net-buttons/js/buttons.colVis.mjs';
// import 'datatables.net-select-dt';
// import 'datatables.net-rowgroup';

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
// import 'datatables.net-select-dt';

DataTable.use(DT);

import { Consts } from '../consts/consts.ts';
import { fetchStandings, fetchLineChartStandings, fetchSeason } from '../services/standingsService.ts';
import { transformStandings, transformLineChartStandings } from '../utils/standingsTransformers.ts';
import { LoadingCircle } from '../components/LoadingCircle.tsx';
import { Visibility } from '@mui/icons-material';


// const divisionNames = ['AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West', 'AL', 'NL', 'Cactus League', 'Grapefruit League'];

const lineChartData = [
    {
        name: 'A',
        uv: 400,
        pv: 240,
        amt: -2400,
    },
    {
        name: 'B',
        uv: 300,
        pv: 456,
        amt: 3000,
    },
    {
        name: 'C',
        uv: 300,
        pv: 139,
        amt: -2400,
    },
    {
        name: 'D',
        uv: 200,
        pv: 980,
        amt: 3000,
    },
    {
        name: 'E',
        uv: 278,
        pv: 390,
        amt: -5000,
    },
    {
        name: 'F',
        uv: 189,
        pv: 480,
        amt: 5000,
    },
    {
        name: 'G',
        uv: -50,
        pv: 480,
        amt: -9000,
    },
];

function StandingsTable({ tableData, standingsMode, groupingsMode }) {

    const isLeague = tableData?.division.includes('League');
    const lastPlayoffIndex = isLeague ? tableData?.teamRecords
        .map((row, i) => ({ row, i }))
        .filter(({ row }) =>
            row.wildCardGamesBack === '-'
        )
        .at(-1)?.i
        : undefined;

    const columns = [
        {
            data: 'team', title: `${tableData?.division}`, width: '20%',
            render: function (data) {
                return `<img src=${data.teamLogo} style="width: 30px; height: 30px; margin-right: 5px; vertical-align: middle" /><span>${data.name}</span>`
            }
        },
        { data: 'wins', title: 'W' },
        { data: 'losses', title: 'L' },
        ...(standingsMode === 'regular season' && groupingsMode === 'division' ? [{ data: 'gamesBack', title: 'GB' }] : []),
        ...(standingsMode === 'regular season' && groupingsMode === 'league' ? [{ data: 'leagueGamesBack', title: 'GB' }] : []),
        ...(standingsMode === 'regular season' && groupingsMode === 'MLB' ? [{ data: 'sportGamesBack', title: 'GB' }] : []),
        ...(standingsMode === 'wild card' ? [{
            data: 'wildCardGamesBack',
            title: 'GB',
            render: (data) => {
                return `<div style="text-align: right;">${data ?? ''}</div>`;
            }
        }] : []),
        ...(standingsMode === 'spring training' ? [{ data: 'springLeagueGamesBack', title: 'GB' }] : []),

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
        {
            data: 'streak.streakCode', title: 'Streak', render: function (data) {
                const streakCode = data ?? '-';
                return streakCode;
            }
        },
        {
            data: 'records', title: 'L10',
            render: function (data) {
                const lastTen = data?.splitRecords?.find(record => record.type === 'lastTen');
                const lastTenRecord = `${lastTen?.wins}-${lastTen?.losses}`;
                return lastTenRecord;
            }
        },
    ];

    return (

        <DataTable
            data={tableData?.teamRecords}
            columns={columns}
            options={{
                searching: false,
                paging: false,
                info: false,
                ordering: false,
                dom: "t",
                // createdRow: (row, data, dataIndex) => {
                //     if (dataIndex === lastPlayoffIndex) {
                //         row.style.borderBottom = '2px solid white';
                //     }
                // }
            }}
        />
    )
}



export default function Standings() {
    const theme = useTheme();
    const [standingsYear, setStandingsYear] = useState(Temporal.Now.plainDateISO().year);
    const isCurrentYear = standingsYear === Temporal.Now.plainDateISO().year;
    const [standingsMode, setStandingsMode] = useState('regular season');
    const [groupingsMode, setGroupingsMode] = useState('division');
    const [leagueTab, setLeagueTab] = useState('AL');
    const firstYear = 2010;
    const [selectedDate, setSelectedDate] = useState(Date.now());
    const [sliderValue, setSliderValue] = useState(0);
    const [debouncedValue, setDebouncedValue] = useState(0);
    const [seasonBounds, setSeasonBounds] = useState({});
    const [standings, setStandings] = useState(null);


    const handleYearChange = (event: SelectChangeEvent) => {
        setStandingsYear(event.target.value as string);
    };

    const handleStandingsModeChange = (event: SelectChangeEvent) => {
        setStandingsMode(event.target.value as string);
    };

    const handleGroupingsModeChange = (event: SelectChangeEvent) => {
        setGroupingsMode(event.target.value as string);
    };

    const handleLeagueChange = (event, newValue) => {
        setLeagueTab(newValue);
    };

    const formatLabel = (value) => {
        if (!seasonBounds || !seasonBounds.start) return "";

        const date = new Date(seasonBounds.start);
        date.setDate(date.getDate() + value);

        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
        });
    }

    const sliderMarks = useMemo(() => {
        if (!seasonBounds) return [];

        return [
            { value: 0, label: 'Opening Day' },
            { value: Math.floor(seasonBounds.totalDays / 2), label: 'Mid-Season' },
            { value: seasonBounds.totalDays, label: 'Final Day' }
        ];
    }, [seasonBounds]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(sliderValue);
        }, 300);

        return () => clearTimeout(handler);
    }, [sliderValue]);

    const selectedDateApiString = useMemo(() => {
        if (!seasonBounds || !seasonBounds.start) return "";

        const date = new Date(seasonBounds.start);
        date.setDate(date.getDate() + sliderValue);

        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    }, [debouncedValue, standingsYear]);


    useEffect(() => {
        const updateSeasonBounds = async () => {
            const season = await fetchSeason(standingsYear);
            const seasonData = season.seasons[0];


            if (standingsMode === 'spring training') {
                const start = new Date(seasonData.springStartDate);
                start.setDate(start.getDate() + 1);
                const end = new Date(seasonData.springEndDate);
                const isCurrentYear = standingsYear === Temporal.Now.plainDateISO().year;
                const diffTime = Math.abs(end - start);
                const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setSeasonBounds({ start, end, totalDays });
                setSliderValue(totalDays);
            } else {
                const start = new Date(seasonData.regularSeasonStartDate);
                start.setDate(start.getDate() + 1);
                const end = new Date(seasonData.regularSeasonEndDate);
                const isCurrentYear = standingsYear === Temporal.Now.plainDateISO().year;
                const effectiveEnd = isCurrentYear ? new Date() : end;
                const diffTime = Math.abs(effectiveEnd - start);
                const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                setSeasonBounds({ start, effectiveEnd, totalDays });
                setSliderValue(totalDays);
            }
        };

        updateSeasonBounds();
    }, [standingsYear, standingsMode]);


    useEffect(() => {
        const getStandings = async () => {
            try {
                if (standingsMode !== 'line chart') {
                    if (!selectedDateApiString) return;
                    const [month, day, year] = selectedDateApiString.split('/');

                    const rawStandings = await fetchStandings(month, day, year, standingsMode, groupingsMode);
                    console.log('after fetch standings');
                    console.log(rawStandings);
                    const formattedStandings = await transformStandings(rawStandings, standingsMode, groupingsMode);
                    console.log('after formatted standings');
                    console.log(formattedStandings);
                    setStandings(formattedStandings);
                } else {
                    // const startDate;
                    // const endDate;
                    console.log('line chart');
                    const season = await fetchSeason(standingsYear);
                    const seasonData = season.seasons[0];
                    console.log('seasonData');
                    console.log(seasonData);
                    const startDate = seasonData.regularSeasonStartDate;
                    const endDate = seasonData.regularSeasonEndDate;
                    
                    const rawStandings = await fetchLineChartStandings(startDate, endDate);
                    console.log('after fetch standings');
                    console.log(rawStandings);

                    const formattedStandings = await transformLineChartStandings(rawStandings, standingsMode, groupingsMode);
                    console.log('after formatted standings');
                    console.log('formattedStandings');
                    console.log(formattedStandings);
                    setStandings(formattedStandings);
                }
            } catch (error) {
                setStandings(null);
            }
        };

        getStandings();
    }, [selectedDateApiString, standingsMode, groupingsMode]);

    console.log('standings');
    console.log(standings);

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
                                {Array.from({ length: Temporal.Now.plainDateISO().year - firstYear + 1 }).map((_, i) => {
                                    const year = Temporal.Now.plainDateISO().year - i;
                                    return <MenuItem key={year} value={year}>{year}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
                <Grid size="auto">
                    {/* <Box> */}
                    <ToggleButtonGroup
                        color="primary"
                        value={standingsMode}
                        exclusive
                        onChange={handleStandingsModeChange}
                    >
                        <ToggleButton value="regular season">Regular Season</ToggleButton>
                        <ToggleButton value="wild card">Wild Card</ToggleButton>
                        <ToggleButton value="spring training">Spring Training</ToggleButton>
                        <ToggleButton value="line chart">Line Chart</ToggleButton>
                    </ToggleButtonGroup>
                    {/* </Box> */}
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
            {/* <Box style={{ display: standingsMode === 'regular season' ? 'block' : 'none' }}> */}
            <Box>
                <Box display='flex' gap={4} sx={{ width: '1500px', mb: 4 }}>
                    {['regular season', 'line chart'].includes(standingsMode) && <ToggleButtonGroup
                        color="primary"
                        value={groupingsMode}
                        exclusive
                        onChange={handleGroupingsModeChange}
                    >
                        <ToggleButton value="division">Division</ToggleButton>
                        <ToggleButton value="league">League</ToggleButton>
                        <ToggleButton value="MLB">MLB</ToggleButton>
                    </ToggleButtonGroup>}
                    {groupingsMode !== 'MLB' && standingsMode !== 'spring training' &&
                        <Tabs value={leagueTab} onChange={handleLeagueChange}>
                            <Tab label="AL" value={'AL'} />
                            <Tab label="NL" value={'NL'} />
                        </Tabs>
                    }
                </Box>
                <Box sx={{ width: '1200px', mb: 4 }}>
                    <Typography component={"span"} sx={{ whiteSpace: 'nowrap' }}>Selected date: {selectedDateApiString.split('/').slice(0, 2).join('/')}</Typography>
                    {seasonBounds &&
                        <Slider
                            defaultValue={30}
                            min={0}
                            max={seasonBounds.totalDays}
                            value={sliderValue}
                            valueLabelDisplay="auto"
                            onChange={(e, val) => setSliderValue(val)}
                            valueLabelFormat={formatLabel}
                            step={1}
                        />
                    }
                </Box>
                {standings ?
                    <Stack spacing={0} sx={{ width: '1250px' }}>

                        {standingsMode !== 'line chart' ?
                            standings.map((divisionData, index) => {
                                switch (standingsMode) {
                                    case 'regular season':
                                        switch (groupingsMode) {
                                            case 'division': {
                                                const isVisible = divisionData.division.includes(leagueTab);
                                                return isVisible && <StandingsTable key={`${divisionData.division}-${standingsMode}-${groupingsMode}`} tableData={divisionData} standingsMode={standingsMode} groupingsMode={groupingsMode} />
                                            }
                                            case 'league': {
                                                const isVisible = (leagueTab === 'AL' && divisionData.division === 'American League') || (leagueTab === 'NL' && divisionData.division === 'National League')
                                                return isVisible && <StandingsTable key={`${divisionData.division}-${standingsMode}-${groupingsMode}`} tableData={divisionData} standingsMode={standingsMode} groupingsMode={groupingsMode} />
                                            }
                                            case 'MLB':
                                                return <StandingsTable key={`${divisionData.division}-${standingsMode}-${groupingsMode}`} tableData={divisionData} standingsMode={standingsMode} groupingsMode={groupingsMode} />
                                            default:
                                                return <></>
                                        }
                                    case 'wild card':
                                        const isVisible = divisionData.division.includes(leagueTab) || (leagueTab === 'AL' && divisionData.division === 'American League') || (leagueTab === 'NL' && divisionData.division === 'National League');
                                        return isVisible && <StandingsTable key={`${divisionData.division}-${standingsMode}-${groupingsMode}`} tableData={divisionData} standingsMode={standingsMode} groupingsMode={groupingsMode} />
                                    case 'spring training':
                                        return <StandingsTable key={`${divisionData.division}-${standingsMode}-${groupingsMode}`} tableData={divisionData} standingsMode={standingsMode} groupingsMode={groupingsMode} />
                                    default:
                                        return <></>
                                }
                            }) :
                            <>
                                {standings.map((divisionData, index) => {
                                    return <Box key={`${divisionData.division}-${standingsMode}-${groupingsMode}`} sx={{ display: 'flex', justifyContent: 'flex-start' }} >
                                        <LineChart style={{ maxHeight: '500px', width: '80%', aspectRatio: 1.618 }} responsive data={lineChartData}>
                                            <CartesianGrid stroke="#ffffff" strokeDasharray="10 10" />
                                            <XAxis dataKey="name" stroke={theme.palette.custom.white} />
                                            <YAxis width="auto" stroke={theme.palette.custom.white} />
                                            {/* map over division data */}
                                            <Line
                                                type="monotone"
                                                dataKey="uv"
                                                stroke="#00ff00"
                                                dot={{
                                                    fill: '#005500',
                                                }}
                                                activeDot={{
                                                    stroke: '#008800',
                                                }}
                                                />
                                        </LineChart>
                                    </Box>
                                    // {divisionData.teamRecords.map((row,)).map((_, i) => {
                                    // const year = Temporal.Now.plainDateISO().year - i;
                                    // return <MenuItem key={year} value={year}>{year}</MenuItem>
                                })}
                                {/* }) */}
                                {/* <Box>abcd</Box> */}
                            </>
                        }

                    </Stack> : <>
                        <LoadingCircle size={60} />
                    </>}
            </Box>
        </Box>
    );
}
