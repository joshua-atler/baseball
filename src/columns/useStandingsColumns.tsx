import { useMemo } from 'react';

import {
    FormattedStandings,
    GroupingsMode,
    LineChartDataset,
    RecordSplit,
    StandingsMode,
    TeamRecord,
} from '../types/standings';

export const useStandingsColumns = (
    tableData: FormattedStandings | LineChartDataset,
    standingsMode: StandingsMode,
    groupingsMode: GroupingsMode
) => {
    const standingsColumns = useMemo(
        () => [
            {
                data: 'team',
                title: `${tableData?.division}`,
                width: '20%',
                render: function (data: TeamRecord['team']) {
                    return `<img src=${data.teamLogo} style="width: 30px; height: 30px; margin-right: 5px; vertical-align: middle" /><span>${data.name}</span>`;
                },
            },
            { data: 'wins', title: 'W' },
            { data: 'losses', title: 'L' },
            ...(standingsMode === 'regular season' &&
            groupingsMode === 'division'
                ? [{ data: 'gamesBack', title: 'GB' }]
                : []),
            ...(standingsMode === 'regular season' && groupingsMode === 'league'
                ? [{ data: 'leagueGamesBack', title: 'GB' }]
                : []),
            ...(standingsMode === 'regular season' && groupingsMode === 'MLB'
                ? [{ data: 'sportGamesBack', title: 'GB' }]
                : []),
            ...(standingsMode === 'wild card'
                ? [
                      {
                          data: 'wildCardGamesBack',
                          title: 'GB',
                          render: (data: string) => {
                              return `<div style="text-align: right;">${data ?? ''}</div>`;
                          },
                      },
                  ]
                : []),
            ...(standingsMode === 'spring training'
                ? [{ data: 'springLeagueGamesBack', title: 'GB' }]
                : []),

            {
                data: 'records',
                title: 'Home',
                render: function (data: Record<string, RecordSplit[]>) {
                    const home = data?.splitRecords?.find(
                        (record) => record.type === 'home'
                    );
                    const homeRecord = `${home?.wins}-${home?.losses}`;
                    return homeRecord;
                },
            },
            {
                data: 'records',
                title: 'Away',
                render: function (data: Record<string, RecordSplit[]>) {
                    const away = data?.splitRecords?.find(
                        (record) => record.type === 'away'
                    );
                    const awayRecord = `${away?.wins}-${away?.losses}`;
                    return awayRecord;
                },
            },
            { data: 'runsScored', title: 'RS' },
            { data: 'runsAllowed', title: 'RA' },
            {
                data: 'streak.streakCode',
                title: 'Streak',
                render: function (data: string) {
                    const streakCode = data ?? '-';
                    return streakCode;
                },
            },
            {
                data: 'records',
                title: 'L10',
                render: function (data: Record<string, RecordSplit[]>) {
                    const lastTen = data?.splitRecords?.find(
                        (record) => record.type === 'lastTen'
                    );
                    const lastTenRecord = `${lastTen?.wins}-${lastTen?.losses}`;
                    return lastTenRecord;
                },
            },
        ],
        [tableData, standingsMode, groupingsMode]
    );

    return { standingsColumns };
};
