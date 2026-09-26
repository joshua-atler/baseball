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
                render: function (
                    data: TeamRecord['team'],
                    _type: string,
                    row
                ) {
                    const clinchIndicator = row.clinched
                        ? row.clinchIndicator
                        : '';
                    const eliminated =
                        !row.clinched && row.wildCardEliminationNumber === 'E'
                            ? 'E'
                            : '';

                    const color =
                        clinchIndicator.length > 0 ? '#55aa55' : '#aa5555';
                    const border = '1px solid #424242';

                    const badgeHtml =
                        clinchIndicator.length > 0 || eliminated.length > 0
                            ? `
                        <span style="
                            border: ${border};
                            color: ${color};
                            font-size: 18px;
                            font-weight: 700;
                            padding: 5px;
                            border-radius: 10px;
                            line-height: 1;
                            display: inline-block;
                        ">${clinchIndicator}${eliminated}</span>
                    `
                            : '';

                    return `<div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <img src="${data.teamLogo}" style="width: 30px; height: 30px; vertical-align: middle" />
                                    <span>${data.name}</span>
                                </div>
                                ${badgeHtml}
                            </div>`;
                },
            },
            { data: 'wins', title: 'W', width: '10%', className: 'dt-center' },
            {
                data: 'losses',
                title: 'L',
                width: '10%',
                className: 'dt-center',
            },
            ...(standingsMode === 'regular season' &&
            groupingsMode === 'division'
                ? [{ data: 'gamesBack', title: 'GB', className: 'dt-right' }]
                : []),
            ...(standingsMode === 'regular season' && groupingsMode === 'league'
                ? [
                      {
                          data: 'leagueGamesBack',
                          title: 'GB',
                          className: 'dt-right',
                      },
                  ]
                : []),
            ...(standingsMode === 'regular season' && groupingsMode === 'MLB'
                ? [
                      {
                          data: 'sportGamesBack',
                          title: 'GB',
                          className: 'dt-right',
                      },
                  ]
                : []),
            ...(standingsMode === 'wild card'
                ? [
                      {
                          data: 'wildCardGamesBack',
                          title: 'GB',
                          className: 'dt-right',
                          render: (data: string) => {
                              return `<div style="text-align: right;">${data ?? ''}</div>`;
                          },
                      },
                  ]
                : []),
            ...(standingsMode === 'spring training'
                ? [
                      {
                          data: 'springLeagueGamesBack',
                          title: 'GB',
                          className: 'dt-right',
                      },
                  ]
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
