import { useMemo } from 'react';

export const useRosterColumns = () => {
    const rosterColumns = useMemo(
        () => [
            { data: 'id', title: '', visible: false },
            {
                data: 'name',
                title: 'Name',
                width: '20%',
                render: function (data, type, row) {
                    return `<img src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${row.id}/headshot/silo/current" style="vertical-align: middle; margin-right: 5px; height: 65px;"> ${data}`;
                },
            },
            { data: 'position', title: 'Position', width: '10%' },
            { data: 'jerseyNumber', title: '#', className: 'dt-right' },
            {
                data: 'batThrow',
                title: 'Bat/Throw',
                width: '10%',
                className: 'dt-center',
            },
            { data: 'weight', title: 'Weight', className: 'dt-right' },
            { data: 'height', title: 'Height', className: 'dt-right' },
            { data: 'age', title: 'Age', className: 'dt-right' },
            {
                data: 'mlbDebut',
                title: 'MLB Debut',
                width: '15%',
                className: 'dt-center',
                defaultContent: 'N/A',
            },
            {
                data: 'type',
                title: 'Type',
                visible: false,
                render: {
                    _: 'display',
                    sort: 'sort',
                    type: 'display',
                },
            },
        ],
        []
    );

    return { rosterColumns };
};
