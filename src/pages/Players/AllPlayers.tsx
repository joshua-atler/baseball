

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';

import { useEffect, useState } from 'react';

import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-rowgroup';
import 'datatables.net-select-dt';

import { Box, ToggleButtonGroup, ToggleButton, SelectChangeEvent } from '@mui/material';

import { fetchAllPlayers } from '../../services/rosterService.ts';


import { useBasedash } from '../../context/BasedashContext';
import { transformPlayerData } from '../../utils/allPlayersTransformer.ts';

DataTable.use(DT);



export default function Rosters({ setTeamViewTab }) {
    const {
        selectedPlayer,
        setSelectedPlayer,
        selectedTeam,
        setSelectedTeam
    } = useBasedash();

    const [viewMode, setViewMode] = useState('All');
    const [allPlayers, setAllPlayers] = useState(null);


    const handleViewModeChange = (event: SelectChangeEvent) => {
        // setIsLoading(true);
        setViewMode(event.target.value as string);
    };

    const handleSelect = (e, dt, type, indexes) => {
        const rowData = dt.row(indexes).data();

        if (rowData && rowData.id) {
            setSelectedPlayer(rowData.id);
            setSelectedTeam(rowData.team);
            setTeamViewTab('Player');
        }
    };

    const handleDeselect = (e, dt, type, indexes) => {
        setSelectedPlayer(null);
    };

    const columns = [
        { data: 'id', title: '', visible: false },
        { data: 'team', title: '', visible: false },
        {
            data: 'name', title: 'Name', width: '20%',
            render: function (data, type, row) {
                return `<img class="roster-player-photo" src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${row.id}/headshot/silo/current"> ${data}`;
            }
        },
        { data: 'position', title: 'Position', width: '10%' },
        { data: 'jerseyNumber', title: '#', className: 'dt-right' },
        { data: 'batThrow', title: 'Bat/Throw', width: '10%', className: 'dt-center' },
        { data: 'weight', title: 'Weight', className: 'dt-right' },
        { data: 'height', title: 'Height', className: 'dt-right' },
        { data: 'age', title: 'Age', className: 'dt-right' },
        { data: 'mlbDebut', title: 'MLB Debut', width: '15%', className: 'dt-center', defaultContent: 'N/A' },
        {
            data: 'type', title: 'Type', visible: false,
            render: {
                _: 'display',
                sort: 'sort',
                type: 'display'
            }
        }
    ];

    useEffect(() => {
        const getAllPlayers = async () => {
            try {
                const rawAllPlayers = await fetchAllPlayers();
                rawAllPlayers.roster = rawAllPlayers.people;
                delete rawAllPlayers.people;
                const formattedAllPlayers = await transformPlayerData(rawAllPlayers);
                const sortedFormattedAllPlayers = [...formattedAllPlayers].sort((a, b) => a.type.sort - b.type.sort);
                setAllPlayers(sortedFormattedAllPlayers.filter(player => (viewMode === 'All' || player.type.display === viewMode)));
            } catch (error) {
                setAllPlayers(null);
                console.error("Team stats fetch failed: ", error);
            }
        };

        getAllPlayers();
    }, [viewMode]);

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mb: 2 }}>
                <ToggleButtonGroup
                    color="primary"
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                >
                    <ToggleButton value="All">All</ToggleButton>
                    <ToggleButton value="Pitcher">Pitchers</ToggleButton>
                    <ToggleButton value="Hitter">Hitters</ToggleButton>
                </ToggleButtonGroup>
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
                        destroy: true,
                        rowGroup: {
                            dataSrc: 'type.display',
                        },
                        order: []
                    }}
                    onSelect={handleSelect}
                    onDeselect={handleDeselect}
                />
            </Box>
        </>
    )

}