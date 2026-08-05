import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-dt';
import 'datatables.net-select-dt';

import { Temporal } from '@js-temporal/polyfill';
import {
    Box,
    FormControl,
    MenuItem,
    Select,
    SelectChangeEvent,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import DT from 'datatables.net-dt';
import DataTable from 'datatables.net-react';
import { useEffect, useState } from 'react';

import { useStatsColumns } from '../columns/useStatsColumns.tsx';
import { LoadingCircle } from '../components/LoadingCircle.tsx';
import { Consts } from '../consts/consts.ts';
import { fetchTeamStats } from '../services/statsService.ts';
import {
    FieldingStats,
    HittingStats,
    PitchingStats,
    StatsGameType,
    StatsMode,
} from '../types/stats.ts';
import {
    transformFieldingStats,
    transformHittingStats,
    transformPitchingStats,
} from '../utils/statsTransformers.ts';

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

const GAME_TYPES = {
    'Regular Season': 'R',
    Postseason: 'P',
    'Spring Training': 'S',
} as const;

export const Stats = () => {
    const [statsYear, setStatsYear] = useState(
        Temporal.Now.plainDateISO().year
    );
    const [statsGameType, setStatsGameType] =
        useState<StatsGameType>('Regular Season');
    const [statsMode, setStatsMode] = useState<StatsMode>('hitting');
    const [hittingTableData, setHittingTableData] = useState<
        HittingStats[] | null
    >(null);
    const [pitchingTableData, setPitchingTableData] = useState<
        PitchingStats[] | null
    >(null);
    const [fieldingTableData, setFieldingTableData] = useState<
        FieldingStats[] | null
    >(null);
    const [isLoading, setIsLoading] = useState(true);

    const firstYear = 2010;
    const options = {
        paging: true,
        searching: false,
        select: {
            info: false,
        },
        pageLength: 30,
        dom: 't',
        columnDefs: [],
        ordering: true,
        buttons: [],
        scrollCollapse: true,
        language: {
            emptyTable: 'No content',
            zeroRecords: 'No content',
        },
    };

    const { hittingColumns, pitchingColumns, fieldingColumns } =
        useStatsColumns();

    const handleYearChange = (event: SelectChangeEvent<number>) => {
        setIsLoading(true);
        setStatsYear(event.target.value as number);
    };

    const handleStatsGameTypeChange = (
        event: SelectChangeEvent<StatsGameType>
    ) => {
        setIsLoading(true);
        setStatsGameType(event.target.value as StatsGameType);
    };
    const handleStatsModeChange = (
        event: React.MouseEvent<HTMLElement>,
        newStatsMode: StatsMode
    ) => {
        setIsLoading(true);
        setStatsMode(newStatsMode);
    };

    useEffect(() => {
        const getStats = async () => {
            const gameTypeCode = GAME_TYPES[statsGameType];
            if (statsMode === 'hitting') {
                const rawHittingStats = await fetchTeamStats(
                    'hitting',
                    statsYear,
                    gameTypeCode
                );
                const hittingStats = transformHittingStats(rawHittingStats);
                setHittingTableData(hittingStats);

                setPitchingTableData(null);
                setFieldingTableData(null);
                setIsLoading(false);
            } else if (statsMode === 'pitching') {
                const rawPitchingStats = await fetchTeamStats(
                    'pitching',
                    statsYear,
                    gameTypeCode
                );
                const pitchingStats = transformPitchingStats(rawPitchingStats);
                setPitchingTableData(pitchingStats);

                setHittingTableData(null);
                setFieldingTableData(null);
                setIsLoading(false);
            } else if (statsMode === 'fielding') {
                const rawFieldingStats = await fetchTeamStats(
                    'fielding',
                    statsYear,
                    gameTypeCode
                );
                const fieldingStats = transformFieldingStats(rawFieldingStats);
                setFieldingTableData(fieldingStats);

                setHittingTableData(null);
                setPitchingTableData(null);
                setIsLoading(false);
            }
        };

        getStats();
    }, [statsYear, statsGameType, statsMode]);

    return (
        <Box>
            <Grid
                container
                spacing={2}
                alignItems="center"
                mt={2}
                ml={2}
                mb={3}
            >
                <Grid>
                    <Typography variant="h6" noWrap component="div">
                        Year
                    </Typography>
                </Grid>
                <Grid>
                    <Box sx={{ minWidth: 120, width: 200 }}>
                        <FormControl fullWidth>
                            <Select
                                defaultValue={2025}
                                displayEmpty
                                value={statsYear}
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
                <Grid>
                    <Box sx={{ minWidth: 120, width: 200 }}>
                        <FormControl fullWidth>
                            <Select
                                value={statsGameType}
                                onChange={handleStatsGameTypeChange}
                            >
                                <MenuItem value={'Regular Season'}>
                                    Regular Season
                                </MenuItem>
                                <MenuItem value={'Postseason'}>
                                    Postseason
                                </MenuItem>
                                <MenuItem value={'Spring Training'}>
                                    Spring Training
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
                <Grid>
                    <ToggleButtonGroup
                        color="primary"
                        value={statsMode}
                        exclusive
                        onChange={handleStatsModeChange}
                    >
                        <ToggleButton value="hitting">Hitting</ToggleButton>
                        <ToggleButton value="pitching">Pitching</ToggleButton>
                        <ToggleButton value="fielding">Fielding</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
            </Grid>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                {isLoading ? (
                    <LoadingCircle size={60} />
                ) : (
                    <>
                        <Box sx={Consts.dataTableContainerSx}>
                            {statsMode === 'hitting' && (
                                <DataTable
                                    data={hittingTableData ?? []}
                                    columns={hittingColumns}
                                    options={options}
                                />
                            )}
                            {statsMode === 'pitching' && (
                                <DataTable
                                    data={pitchingTableData ?? []}
                                    columns={pitchingColumns}
                                    options={options}
                                />
                            )}
                            {statsMode === 'fielding' && (
                                <DataTable
                                    data={fieldingTableData ?? []}
                                    columns={fieldingColumns}
                                    options={options}
                                />
                            )}
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};
