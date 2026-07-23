

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';

import { useEffect, useState } from 'react';

import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-rowgroup';
import 'datatables.net-select-dt';

import { Box, ToggleButtonGroup, ToggleButton, SelectChangeEvent, Select, MenuItem } from '@mui/material';

import { fetchPlayerStats } from '../../services/rosterService.ts';
import { Consts } from '../../consts/consts.ts';

import { useBasedash } from '../../context/BasedashContext';
import { LoadingCircle } from '../../components/LoadingCircle.tsx';

DataTable.use(DT);



export default function Rosters({ setTeamViewTab }) {
    const {
        setSelectedPlayer,
        setSelectedTeam
    } = useBasedash();

    const [viewMode, setViewMode] = useState('Pitchers');
    const [allPlayers, setAllPlayers] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [standingsYear, setStandingsYear] = useState(Temporal.Now.plainDateISO().year);
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

    const columns = viewMode === 'Pitchers' ? [
        { data: 'player.id', title: '', visible: false },
        {
            data: 'player.fullName', title: 'Name', width: '20%', visible: true,
            render: function (data, type, row) {
                return `<img class="roster-player-photo" src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${row.player.id}/headshot/silo/current"> ${data}`;
            }
        },
        {
            data: 'team.name', title: 'Team', width: '20%', visible: true,
            render: function (data, type, row) {
                const selectedTeamLogo = data ? Consts.teamInfo[data]?.logo : '';
                return `<img class="roster-player-photo" src="${selectedTeamLogo}" style="width: 50px; height: 50px;" onerror="this.style.opacity='0';"/> ${data}`;
            }
        },
        { data: 'stat.gamesPlayed', title: 'GP', visible: true },
        { data: 'stat.wins', title: 'W', visible: true },
        { data: 'stat.losses', title: 'L', visible: true },
        { data: 'stat.strikeOuts', title: 'SO', visible: true },
        { data: 'stat.inningsPitched', title: 'IP', visible: true },
        { data: 'stat.hits', title: 'H', visible: true },
        { data: 'stat.runs', title: 'R', visible: true },
        { data: 'stat.era', title: 'ERA', className: 'dt-right', visible: true },
        { data: 'stat.whip', title: 'WHIP', className: 'dt-right', visible: true }
    ] : [
        { data: 'player.id', title: '', visible: false },
        {
            data: 'player.fullName', title: 'Name', width: '20%', visible: true,
            render: function (data, type, row) {
                return `<img class="roster-player-photo" src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${row.player.id}/headshot/silo/current"> ${data}`;
            }
        },
        {
            data: 'team.name', title: 'Team', width: '20%', visible: true,
            render: function (data, type, row) {
                const selectedTeamLogo = data ? Consts.teamInfo[data].logo : '';
                return `<img class="roster-player-photo" src="${selectedTeamLogo}" style="width: 50px; height: 50px;" /> ${data}`;
            }
        },
        { data: 'stat.gamesPlayed', title: 'GP', visible: true },
        { data: 'stat.atBats', title: 'AB', visible: true },
        { data: 'stat.avg', title: 'AVG', visible: true },
        { data: 'stat.hits', title: 'H', visible: true },
        { data: 'stat.doubles', title: '2B', visible: true },
        { data: 'stat.triples', title: '3B', visible: true },
        { data: 'stat.homeRuns', title: 'HR', visible: true },
        { data: 'stat.runs', title: 'R', visible: true },
        { data: 'stat.rbi', title: 'RBI', visible: true },
        { data: 'stat.baseOnBalls', title: 'BB', visible: true },
        { data: 'stat.strikeOuts', title: 'SO', visible: true }
    ];


    useEffect(() => {
        const getAllPlayers = async () => {
            try {
                setIsLoading(true);

                const allPitchers = await fetchPlayerStats('pitching', standingsYear);
                const allHitters = await fetchPlayerStats('hitting', standingsYear);

                if (viewMode === 'Pitchers') {
                    setAllPlayers(allPitchers.stats[0].splits);
                } else if (viewMode === 'Hitters') {
                    setAllPlayers(allHitters.stats[0].splits);
                }

            } catch (error) {
                setAllPlayers(null);
                console.error("Team stats fetch failed: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        getAllPlayers();
    }, [viewMode, standingsYear]);

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
                    <Select
                        value={standingsYear}
                        onChange={handleYearChange}
                    >
                        {Array.from({ length: Temporal.Now.plainDateISO().year - firstYear + 1 }).map((_, i) => {
                            const year = Temporal.Now.plainDateISO().year - i;
                            return <MenuItem key={year} value={year}>{year}</MenuItem>
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
                {
                    isLoading ?
                        <LoadingCircle size={60} /> : <>
                            <Box sx={{
                                '& .dataTable tbody tr:hover': {
                                    backgroundColor: (theme) => `${theme.palette.custom.lightGray} !important`,
                                },
                                '& table.dataTable tbody tr.selected *, & table.dataTable tbody tr td.selected *': {
                                    backgroundColor: (theme) => `${theme.palette.custom.darkGray} !important`,
                                    boxShadow: 'none !important'
                                },
                            }}>
                                <DataTable
                                    data={allPlayers}
                                    columns={columns}
                                    options={{
                                        select: {
                                            info: false
                                        },
                                        searching: true,
                                        paging: false,
                                        info: false,
                                        ordering: true,
                                        dom: "ft",
                                        destroy: true
                                    }}
                                    onSelect={handleSelect}
                                    onDeselect={handleDeselect}
                                />
                            </Box>
                        </>
                }
            </Box>
        </>
    )

}