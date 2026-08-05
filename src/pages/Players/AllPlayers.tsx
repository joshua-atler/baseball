import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-rowgroup';
import 'datatables.net-select-dt';

import { Temporal } from '@js-temporal/polyfill';
import {
    Box,
    MenuItem,
    Select,
    SelectChangeEvent,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import DT from 'datatables.net-dt';
import DataTable from 'datatables.net-react';
import { useEffect, useState } from 'react';

import { useAllPlayersColumns } from '../../columns/useAllPlayersColumns.tsx';
import { LoadingCircle } from '../../components/LoadingCircle.tsx';
import { useBasedash } from '../../context/BasedashContext';
import { fetchPlayerStats } from '../../services/rosterService.ts';

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

export const AllPlayers = ({ setTeamViewTab }) => {
    const { setSelectedPlayer, setSelectedTeam } = useBasedash();

    const [viewMode, setViewMode] = useState('Pitchers');
    const [allPlayers, setAllPlayers] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [standingsYear, setStandingsYear] = useState(
        Temporal.Now.plainDateISO().year
    );
    const firstYear = 2010;

    const handleYearChange = (event: SelectChangeEvent) => {
        setStandingsYear(event.target.value as string);
    };

    const handleViewModeChange = (event: SelectChangeEvent) => {
        setViewMode(event.target.value as string);
    };

    const handleSelect = (e, dt, type, indexes) => {
        const rowData = dt.row(indexes).data();

        if (rowData && rowData.player.id) {
            setSelectedPlayer(rowData.player.id);
            setSelectedTeam(rowData.team.name);
            setTeamViewTab('Player');
        }
    };

    const handleDeselect = (e, dt, type, indexes) => {
        setSelectedPlayer(null);
    };

    const { allPlayersColumns } = useAllPlayersColumns(viewMode);

    useEffect(() => {
        const getAllPlayers = async () => {
            try {
                setIsLoading(true);

                const allPitchers = await fetchPlayerStats(
                    'pitching',
                    standingsYear
                );
                const allHitters = await fetchPlayerStats(
                    'hitting',
                    standingsYear
                );

                if (viewMode === 'Pitchers') {
                    setAllPlayers(allPitchers.stats[0].splits);
                } else if (viewMode === 'Hitters') {
                    setAllPlayers(allHitters.stats[0].splits);
                }
            } catch (error) {
                setAllPlayers(null);
                console.error('Team stats fetch failed: ', error);
            } finally {
                setIsLoading(false);
            }
        };

        getAllPlayers();
    }, [viewMode, standingsYear]);

    return (
        <>
            <Box
                sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 2 }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                    <Select value={standingsYear} onChange={handleYearChange}>
                        {Array.from({
                            length:
                                Temporal.Now.plainDateISO().year -
                                firstYear +
                                1,
                        }).map((_, i) => {
                            const year = Temporal.Now.plainDateISO().year - i;
                            return (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            );
                        })}
                    </Select>
                    <ToggleButtonGroup
                        color="primary"
                        value={viewMode}
                        exclusive
                        onChange={handleViewModeChange}
                    >
                        <ToggleButton value="Pitchers">Pitchers</ToggleButton>
                        <ToggleButton value="Hitters">Hitters</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {isLoading ? (
                    <LoadingCircle size={60} />
                ) : (
                    <>
                        <Box
                            sx={{
                                '& .dataTable tbody tr:hover': {
                                    backgroundColor: (theme) =>
                                        `${theme.palette.custom.lightGray} !important`,
                                },
                                '& table.dataTable tbody tr.selected *, & table.dataTable tbody tr td.selected *':
                                    {
                                        backgroundColor: (theme) =>
                                            `${theme.palette.custom.darkGray} !important`,
                                        boxShadow: 'none !important',
                                    },
                            }}
                        >
                            <DataTable
                                data={allPlayers}
                                columns={allPlayersColumns}
                                options={{
                                    select: {
                                        info: false,
                                    },
                                    searching: true,
                                    paging: false,
                                    info: false,
                                    ordering: true,
                                    dom: 'ft',
                                    destroy: true,
                                }}
                                onSelect={handleSelect}
                                onDeselect={handleDeselect}
                            />
                        </Box>
                    </>
                )}
            </Box>
        </>
    );
};
