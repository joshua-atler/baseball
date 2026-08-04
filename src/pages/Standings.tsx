import { Temporal } from '@js-temporal/polyfill';
import InfoIcon from '@mui/icons-material/Info';
import {
    Box,
    FormControl,
    IconButton,
    MenuItem,
    Select,
    SelectChangeEvent,
    Slider,
    Stack,
    Tab,
    Tabs,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import DT from 'datatables.net-dt';
import DataTable from 'datatables.net-react';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);


import { useStandingsColumns } from '../columns/useStandingsColumns.tsx';
import { LoadingCircle } from '../components/LoadingCircle.tsx';
import { Consts } from '../consts/consts.ts';
import { fetchLineChartStandings, fetchSeason, fetchStandings } from '../services/standingsService.ts';
import { FormattedStandings, GroupingsMode, LineChartDataset, StandingsMode } from '../types/standings.ts';
import { formatter } from '../utils/dateFormatters.ts';
import { transformLineChartStandings, transformStandings } from '../utils/standingsTransformers.ts';


function StandingsTable({ tableData, standingsMode, groupingsMode }) {

    const isLeague = tableData?.division.includes('League');
    const lastPlayoffIndex = isLeague ? tableData?.teamRecords
        .map((row, i) => ({ row, i }))
        .filter(({ row }) =>
            row.wildCardGamesBack === '-'
        )
        .at(-1)?.i
        : undefined;

    const { standingsColumns } = useStandingsColumns(tableData, standingsMode, groupingsMode);

    return (

        <DataTable
            data={tableData?.teamRecords}
            columns={standingsColumns}
            options={{
                searching: false,
                paging: false,
                info: false,
                ordering: false,
                dom: "t",
                destroy: true,
            }}
        />
    )
}



export default function Standings() {
    const theme = useTheme();
    const [standingsYear, setStandingsYear] = useState(Temporal.Now.plainDateISO().year);
    const isCurrentYear = standingsYear === Temporal.Now.plainDateISO().year;
    const [standingsMode, setStandingsMode] = useState<StandingsMode>('regular season');
    const [groupingsMode, setGroupingsMode] = useState<GroupingsMode>('division');
    const [leagueTab, setLeagueTab] = useState('AL');
    const firstYear = 2010;
    const [sliderValue, setSliderValue] = useState(0);
    const [debouncedValue, setDebouncedValue] = useState(0);
    const [seasonBounds, setSeasonBounds] = useState({});
    const [standings, setStandings] = useState<FormattedStandings[] | LineChartDataset[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    const handleYearChange = (event: SelectChangeEvent) => {
        setIsLoading(true);
        setStandingsYear(event.target.value as string);
    };

    const handleStandingsModeChange = (event: SelectChangeEvent) => {
        setIsLoading(true);
        setStandingsMode(event.target.value as string);
    };

    const handleGroupingsModeChange = (event: SelectChangeEvent) => {
        setIsLoading(true);
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
            setIsLoading(true);
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
            setStandings(null);

            if (standingsMode !== 'line chart' && !selectedDateApiString) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                if (standingsMode !== 'line chart') {
                    if (!selectedDateApiString) return;
                    const [month, day, year] = selectedDateApiString.split('/');

                    const rawStandings = await fetchStandings(month, day, year, standingsMode, groupingsMode);
                    const formattedStandings = await transformStandings(rawStandings, standingsMode, groupingsMode);
                    setStandings(formattedStandings);
                } else {
                    const season = await fetchSeason(standingsYear);
                    const seasonData = season.seasons[0];
                    const startDate = seasonData.regularSeasonStartDate;
                    const endDate = isCurrentYear ? formatter.format(new Date()) : seasonData.regularSeasonEndDate;

                    const rawStandings = await fetchLineChartStandings(startDate, endDate);
                    const formattedStandings = transformLineChartStandings(rawStandings, groupingsMode);

                    setStandings(formattedStandings);
                }
            } catch (error) {
                setStandings(null);
            } finally {
                setIsLoading(false);
            }
        };

        getStandings();
    }, [selectedDateApiString, standingsMode, groupingsMode]);

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
                {standingsMode !== 'line chart' && <Box sx={{ width: '1200px', mb: 4 }}>
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
                </Box>}
                {isLoading ?
                    <LoadingCircle size={60} /> : <>
                        {standingsMode !== 'line chart' ? (
                            <Stack key="table-view-container" spacing={0} sx={{ width: '1250px' }}>
                                <Box key={`${standingsMode}-${groupingsMode}-${leagueTab}`}>
                                    {standings && standings.map((divisionData, index) => {
                                        switch (standingsMode) {
                                            case 'regular season':
                                                switch (groupingsMode) {
                                                    case 'division': {
                                                        const isVisible = divisionData.division.includes(leagueTab);
                                                        return isVisible && <StandingsTable key={`table-${divisionData.division}-${standingsMode}-${groupingsMode}`} tableData={divisionData} standingsMode={standingsMode} groupingsMode={groupingsMode} />
                                                    }
                                                    case 'league': {
                                                        const isVisible = (leagueTab === 'AL' && divisionData.division === 'American League') || (leagueTab === 'NL' && divisionData.division === 'National League')
                                                        return isVisible && <StandingsTable key={`table-${divisionData.division}-${standingsMode}-${groupingsMode}`} tableData={divisionData} standingsMode={standingsMode} groupingsMode={groupingsMode} />
                                                    }
                                                    case 'MLB':
                                                        return <StandingsTable key={`table-${divisionData.division}-${standingsMode}-${groupingsMode}`} tableData={divisionData} standingsMode={standingsMode} groupingsMode={groupingsMode} />
                                                    default:
                                                        return <></>
                                                }
                                            case 'wild card':
                                                const isVisible = divisionData.division.includes(leagueTab) || (leagueTab === 'AL' && divisionData.division === 'American League') || (leagueTab === 'NL' && divisionData.division === 'National League');
                                                return isVisible && <StandingsTable key={`table-${divisionData.division}-${standingsMode}-${groupingsMode}`} tableData={divisionData} standingsMode={standingsMode} groupingsMode={groupingsMode} />
                                            case 'spring training':
                                                return <StandingsTable key={`table-${divisionData.division}-${standingsMode}-${groupingsMode}`} tableData={divisionData} standingsMode={standingsMode} groupingsMode={groupingsMode} />
                                            default:
                                                return <></>
                                        }
                                    })}
                                </Box>
                            </Stack>
                        ) : (
                            <Stack key="chart-view-container" spacing={0} sx={{ width: '1250px' }}>
                                <Box key="chart-view-content">
                                    <Typography variant="h4">Wins - Losses</Typography>
                                    {standings && standings.map((divisionData, index) => {
                                        let isVisible = true;
                                        switch (groupingsMode) {
                                            case 'division':
                                                isVisible = divisionData.division.includes(leagueTab);
                                                break;
                                            case 'league':
                                                isVisible = (leagueTab === 'AL' && divisionData.division === 'American League') || (leagueTab === 'NL' && divisionData.division === 'National League')
                                                break;
                                            case 'MLB':
                                                break;
                                            default:
                                                break;
                                        }
                                        return isVisible && (
                                            <Box key={`chart-${divisionData.division}-${standingsMode}-${groupingsMode}`} sx={{ display: 'flex', flexDirection: 'column' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Typography variant="h5">{divisionData.division}</Typography>
                                                </Box>
                                                <LineChart style={{ maxHeight: '500px', aspectRatio: 1.618 }} responsive data={divisionData.teamRecords}>
                                                    <CartesianGrid stroke={theme.palette.custom.white} fill={theme.palette.custom.darkGray} strokeDasharray="10 10" />
                                                    <XAxis dataKey="date" stroke={theme.palette.custom.white} />
                                                    <YAxis width="auto" stroke={theme.palette.custom.white} />
                                                    <RechartsTooltip
                                                        contentStyle={{ backgroundColor: theme.palette.custom.dark, border: '0px' }}
                                                        itemStyle={{ color: theme.palette.custom.white, fontSize: '15px' }}
                                                        labelStyle={{ color: theme.palette.custom.white, fontWeight: 'bold' }}
                                                        itemSorter={(item) => -item.value}
                                                    />
                                                    {Object.keys(Consts.teamInfo).map((teamName, i) => {
                                                        return <Line
                                                            key={teamName}
                                                            type="monotone"
                                                            dataKey={teamName}
                                                            stroke={Consts.teamInfo[teamName].colors.primary}
                                                            strokeWidth={3}
                                                            dot={false}
                                                            activeDot={{
                                                                stroke: theme.palette.custom.white,
                                                            }}
                                                        />
                                                    })}
                                                </LineChart>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Stack>)}
                    </>}
            </Box>
        </Box>
    );
}