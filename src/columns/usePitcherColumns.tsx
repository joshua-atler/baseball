import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { renderToString } from 'react-dom/server';
import { HiCheck, HiExternalLink, HiX } from 'react-icons/hi';

import { Consts } from '../consts/consts';


export const usePitcherColumns = () => {
    const theme = useTheme();

    const pitcherStatsColumns = useMemo(() => [
        { data: 'year', title: 'Year', className: 'dt-right' },
        {
            data: 'team', title: 'Team', render: (data) => {
                if (data.length > 0) {
                    const logoURL = Consts.teamInfo[data].logo;
                    return `<img src=${logoURL} style="width: 40px; height: 40px" />`
                } else {
                    return '';
                }
            }
        },
        { data: 'stats.wins', title: 'W' },
        { data: 'stats.losses', title: 'L' },
        { data: 'stats.era', title: 'ERA' },
        { data: 'stats.gamesPlayed', title: 'G' },
        { data: 'stats.gamesStarted', title: 'GS' },
        { data: 'stats.saves', title: 'S' },
        { data: 'stats.inningsPitched', title: 'IP' },
        { data: 'stats.strikeOuts', title: 'K' },
        { data: 'stats.whip', title: 'WHIP', },
    ], []);

    const pitcherGameLogColumns = useMemo(() => [
        { data: 'gamePk', title: '', visible: false },
        { data: 'date', title: 'Date', className: 'dt-right' },
        {
            data: 'matchup', title: 'Matchup', render: (data) => {
                const awayLogoURL = Consts.teamInfo[data[0]].logo ?? '';
                const homeLogoURL = Consts.teamInfo[data[1]].logo ?? '';
                return `<span style="display: inline-flex; align-items: center"><img src=${awayLogoURL} style="width: 40px; height: 40px" />
                <span style="margin: 0 10px; font-weight: 500;">@</span>
                <img src=${homeLogoURL} style="width: 40px; height: 40px" /></span>`;
            }
        },
        {
            data: 'isWin', title: 'Win/Loss', render: (data) => {
                if (data) {
                    return `
                        <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background-color: #e8f5e9; border: 1px solid #a5d6a7; vertical-align: middle;">
                        ${renderToString(<HiCheck style={{ color: '#2e7d32', fontSize: '1.1rem' }} />)}
                        </span>
                    `
                } else {
                    return `
                        <span style="display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background-color: #ffebee; border: 1px solid #ef9a9a; vertical-align: middle;">
                        ${renderToString(<HiX style={{ color: '#c62828', fontSize: '1.1rem' }} />)}
                    </span>
                    `
                };
            }
        },
        { data: 'pitches', title: 'Pitches' },
        { data: 'inningsPitched', title: 'IP' },
        { data: 'earnedRuns', title: 'ER' },
        { data: 'earnedRunAverage', title: 'ERA' },
        { data: 'hits', title: 'H' },
        { data: 'runs', title: 'R' },
        { data: 'strikeouts', title: 'K' },
        { data: 'walks', title: 'BB' },
        { data: 'whip', title: 'WHIP' },
        {
            title: 'Actions',
            data: null,
            className: 'dt-center',
            render: (data, type, row) => {
                return `
                <button
                    onclick="event.stopPropagation(); handleViewGameClick(${row.gamePk})"
                    style="padding: 5px 10px; background-color: ${theme.palette.custom.highlightGreen}; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px;">
                    View Game
                    ${renderToString(<HiExternalLink style={{ verticalAlign: 'middle' }} size={20} />)}
                </button>
            `;
            }
        }
    ], []);


    return { pitcherStatsColumns, pitcherGameLogColumns };
}
