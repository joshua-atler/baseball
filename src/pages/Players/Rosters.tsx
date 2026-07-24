// @ts-nocheck

import { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

import { Box, Typography } from '@mui/material';

import $ from 'jquery';
import SlimSelect from 'slim-select';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-rowgroup';
import 'datatables.net-select-dt';

import { fetchRoster } from '../../services/rosterService.ts';

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';

import { useBasedash } from '../../context/BasedashContext';

import { Consts } from '../../consts/consts.ts';
import '../../styles/style.css';
import { TeamSelect } from '../../components/TeamSelect.tsx';
import { transformRoster } from '../../utils/rosterTransformer.ts';
import { useRosterColumns } from '../../columns/useRosterColumns.tsx';


DataTable.use(DT);


export default function Rosters({ setTeamViewTab }) {
    const {
        selectedPlayer,
        setSelectedPlayer,
        selectedTeam,
        setSelectedTeam
    } = useBasedash();

    const selectedTeamLogo = selectedTeam ? Consts.teamInfo[selectedTeam].logo : '';

    const [roster, setRoster] = useState(null);

    const handleSelect = (e, dt, type, indexes) => {
        const rowData = dt.row(indexes).data();

        if (rowData && rowData.id) {
            setSelectedPlayer(rowData.id);
            setTeamViewTab('Player');
        }
    };

    const handleDeselect = (e, dt, type, indexes) => {
        setSelectedPlayer(null);
    };

    const { rosterColumns } = useRosterColumns();

    useEffect(() => {

        const getRoster = async () => {
            if (!selectedTeam) {
                setRoster(null);
                return;
            };

            try {
                const rawRoster = await fetchRoster(Consts.teamInfo[selectedTeam].id);
                const formattedRoster = await transformRoster(rawRoster);
                setRoster(formattedRoster);
            } catch (error) {
                setRoster(null);
                console.error("Team stats fetch failed: ", error);
            }
        };

        getRoster();
    }, [selectedTeam]);

    const handleTeamChange = useCallback((val) => {
        setSelectedTeam(val[0]);
    }, []);

    return (
        <>
            <Box sx={{ width: '100%', mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 2 }}>
                    {selectedTeamLogo &&
                        <img src={selectedTeamLogo} style={{ width: 80, height: 80 }} ></img>
                    }
                    <Typography variant='h6'>
                        {selectedTeam}
                    </Typography>
                    <Box sx={{ ml: 'auto', width: '600px' }}>
                        <TeamSelect
                            currentValue={selectedTeam}
                            onTeamChange={handleTeamChange}
                            multiple={false} />
                    </Box>
                </Box>
                <Box sx={{ height: '30px', backgroundColor: selectedTeam ? Consts.teamInfo[selectedTeam].colors.primary : '' }}></Box>
                <Box sx={{ height: '20px', backgroundColor: selectedTeam ? Consts.teamInfo[selectedTeam].colors.secondary : '' }}></Box>
            </Box>

            {roster &&
                <DataTable
                    data={roster}
                    columns={rosterColumns}
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
                        order: [[9, 'asc']],
                        orderFixed: [[9, 'asc']],
                    }}
                    onSelect={handleSelect}
                    onDeselect={handleDeselect}
                />
            }
        </>
    )
}