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
import { Consts } from '../../consts/consts.ts';
import { useBasedash } from '../../context/BasedashContext';
import { fetchPlayerStats } from '../../services/rosterService.ts';
import { RosterViewMode } from '../../types/roster.ts';

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

export const AllPlayers = ({ setTeamViewTab }) => {
    const { setSelectedPlayer, setSelectedTeam } = useBasedash();

    const [viewMode, setViewMode] = useState<RosterViewMode>('Pitchers');
    const [allPlayers, setAllPlayers] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [standingsYear, setStandingsYear] = useState(
        Temporal.Now.plainDateISO().year
    );
    const firstYear = 2010;

    const handleYearChange = (event: SelectChangeEvent<number>) => {
        setStandingsYear(Number(event.target.value));
    };

    const handleViewModeChange = (
        _event: React.MouseEvent<HTMLElement>,
        value: RosterViewMode
    ) => {
        setViewMode(value);
    };

    const handleSelect = (_e: any, dt: any, _type: any, indexes: any) => {
        const rowData = dt.row(indexes).data();

        if (rowData && rowData.player.id) {
            setSelectedPlayer(rowData.player.id);
            setSelectedTeam(rowData.team.name);
            setTeamViewTab('Player');
        }
    };

    const handleDeselect = () => {
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
                    <Select<number>
                        value={standingsYear}
                        onChange={handleYearChange}
                    >
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
                        <Box sx={Consts.dataTableContainerSx}>
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
