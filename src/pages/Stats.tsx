// @ts-nocheck

import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-dt';
import 'datatables.net-select-dt';

import {
  Box,
  FormControl,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import DT from 'datatables.net-dt';
import DataTable from 'datatables.net-react';
import { useEffect, useState } from 'react';

import { useStatsColumns } from '../columns/useStatsColumns.tsx';
import { LoadingCircle } from '../components/LoadingCircle.tsx';
import { fetchTeamStats } from '../services/statsService.ts';
import { transformFieldingStats, transformHittingStats, transformPitchingStats } from '../utils/statsTransformers.ts';


DataTable.use(DT);

export default function Stats({
}) {

    const [statsYear, setStatsYear] = useState(Temporal.Now.plainDateISO().year);
    const [statsGameType, setSeasonType] = useState('Regular Season');
    const [statsMode, setStatsMode] = useState('hitting');
    const [hittingTableData, setHittingTableData] = useState(null);
    const [pitchingTableData, setPitchingTableData] = useState(null);
    const [fieldingTableData, setFieldingTableData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const firstYear = 2010;
    const options = {
        paging: true,
        searching: false,
        select: {
            info: false
        },
        pageLength: 30,
        dom: "t",
        columnDefs: [],
        ordering: true,
        buttons: [],
        scrollCollapse: true,
        language: {
            emptyTable: "No content",
            zeroRecords: "No content"
        }
    };

    const { hittingColumns, pitchingColumns, fieldingColumns } = useStatsColumns();

    const handleYearChange = (event) => {
        setIsLoading(true);
        setStatsYear(event.target.value as string);
    };

    const handleStatsGameTypeChange = (event) => {
        setIsLoading(true);
        setSeasonType(event.target.value as string);
    };

    const handleStatsModeChange = (event) => {
        setIsLoading(true);
        setStatsMode(event.target.value as string);
    };

    const getGameType = (gameType) => {
        const gameTypes = {
            "Regular Season": "R",
            "Postseason": "P",
            "Spring Training": "S"
        };

        return gameTypes[gameType];
    }

    useEffect(() => {
        const getStats = async () => {
            if (statsMode === 'hitting') {
                const rawHittingStats = await fetchTeamStats('hitting', statsYear, getGameType(statsGameType));
                const hittingStats = await transformHittingStats(rawHittingStats);
                setHittingTableData(hittingStats);

                setPitchingTableData(null);
                setFieldingTableData(null);
                setIsLoading(null);
            } else if (statsMode === 'pitching') {
                const rawPitchingStats = await fetchTeamStats('pitching', statsYear, getGameType(statsGameType));
                const pitchingStats = await transformPitchingStats(rawPitchingStats);
                setPitchingTableData(pitchingStats);

                setHittingTableData(null);
                setFieldingTableData(null);
                setIsLoading(null);
            } else if (statsMode === 'fielding') {
                const rawFieldingStats = await fetchTeamStats('fielding', statsYear, getGameType(statsGameType));
                const fieldingStats = await transformFieldingStats(rawFieldingStats);
                setFieldingTableData(fieldingStats);

                setHittingTableData(null);
                setPitchingTableData(null);
                setIsLoading(null);
            }
        };

        getStats();


    }, [statsYear, statsGameType, statsMode]);

    return (
        <Box>
            <Grid container spacing={2} alignItems="center" mt={2} ml={2} mb={3}>
                <Grid>
                    <Typography variant="h6" noWrap component="div">
                        Year
                    </Typography>
                </Grid>
                <Grid>
                    <Box sx={{ minWidth: 120, width: 200 }}>
                        <FormControl fullWidth>
                            <Select defaultValue={2025} displayEmpty
                                value={statsYear}
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
                <Grid>
                    <Box sx={{ minWidth: 120, width: 200 }}>
                        <FormControl fullWidth>
                            <Select defaultValue={2025} displayEmpty
                                value={statsGameType}
                                onChange={handleStatsGameTypeChange}
                            >
                                <MenuItem value={"Regular Season"}>Regular Season</MenuItem>
                                <MenuItem value={"Postseason"}>Postseason</MenuItem>
                                <MenuItem value={"Spring Training"}>Spring Training</MenuItem>
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
                {isLoading ?
                    <LoadingCircle size={60} /> : <>
                        <Box sx={{
                            width: 1200,
                            '& .dataTable tbody tr:hover': {
                                backgroundColor: (theme) => `${theme.palette.custom.lightGray} !important`,
                            },
                            '& table.dataTable tbody tr.selected, & table.dataTable tbody tr td.selected': {
                                backgroundColor: (theme) => `${theme.palette.custom.darkGray} !important`,
                                boxShadow: 'none !important'
                            },
                        }}>
                            {statsMode === 'hitting' && <>
                                <DataTable
                                    hidden={true}
                                    data={hittingTableData}
                                    columns={hittingColumns}
                                    autoWidth={false}
                                    options={options}
                                />
                            </>}
                            {statsMode === 'pitching' && <>
                                <DataTable
                                    hidden={true}
                                    data={pitchingTableData}
                                    columns={pitchingColumns}
                                    autoWidth={false}
                                    options={options}
                                />
                            </>}
                            {statsMode === 'fielding' && <>
                                <DataTable
                                    hidden={true}
                                    data={fieldingTableData}
                                    columns={fieldingColumns}
                                    autoWidth={false}
                                    options={options}
                                />
                            </>}
                        </Box>
                    </>
                }
            </Box>
        </Box>
    )
}