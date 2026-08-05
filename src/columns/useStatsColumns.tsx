import { useMemo } from 'react';

export const useStatsColumns = () => {
    const hittingColumns = useMemo(
        () => [
            {
                data: 'team',
                title: `Team`,
                width: '30%',
                render: function (data) {
                    return `<img src=${data.logo} style="width: 30px; height: 30px; margin-right: 5px; vertical-align: middle" /><span>${data.name}</span>`;
                },
            },
            { data: 'runs', title: 'R' },
            { data: 'hits', title: 'H' },
            { data: 'doubles', title: '2B' },
            { data: 'triples', title: '3B' },
            { data: 'homeRuns', title: 'HR' },
            { data: 'rbi', title: 'RBI' },
            { data: 'avg', title: 'AVG' },
            { data: 'obp', title: 'OBP' },
            { data: 'slg', title: 'SLG' },
            { data: 'ops', title: 'OPS' },
            { data: 'stolenBases', title: 'SB' },
        ],
        []
    );

    const pitchingColumns = useMemo(
        () => [
            {
                data: 'team',
                title: `Team`,
                width: '30%',
                render: function (data) {
                    return `<img src=${data.logo} style="width: 30px; height: 30px; margin-right: 5px; vertical-align: middle" /><span>${data.name}</span>`;
                },
            },
            { data: 'era', title: 'ERA', width: '10%' },
            { data: 'inningsPitched', title: 'IP' },
            { data: 'hits', title: 'H' },
            { data: 'runs', title: 'R' },
            { data: 'homeRuns', title: 'HR' },
            { data: 'strikeOuts', title: 'K' },
            { data: 'baseOnBalls', title: 'BB' },
            { data: 'avg', title: 'AVG' },
            { data: 'whip', title: 'WHIP' },
            { data: 'shutouts', title: 'SHO' },
            { data: 'saves', title: 'SV' },
        ],
        []
    );

    const fieldingColumns = useMemo(
        () => [
            {
                data: 'team',
                title: `Team`,
                width: '30%',
                render: function (data) {
                    return `<img src=${data.logo} style="width: 30px; height: 30px; margin-right: 5px; vertical-align: middle" /><span>${data.name}</span>`;
                },
            },
            { data: 'fielding', title: 'FPCT', width: '10%' },
            { data: 'chances', title: 'TC' },
            { data: 'assists', title: 'A' },
            { data: 'putOuts', title: 'PO' },
            { data: 'errors', title: 'E' },
            { data: 'doublePlays', title: 'DP' },
            { data: 'triplePlays', title: 'TP' },
            { data: 'wildPitches', title: 'WP' },
        ],
        []
    );

    return { hittingColumns, pitchingColumns, fieldingColumns };
};
