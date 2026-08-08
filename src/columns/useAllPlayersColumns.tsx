import { useMemo } from 'react';

import { Consts, TeamName } from '../consts/consts';
import { RosterViewMode } from '../types/roster';
import { AllPlayersPitcher } from '../types/allPlayers';

const IMG_STYLE = 'vertical-align: middle; margin-right: 5px; height: 65px;';

export const useAllPlayersColumns = (viewMode: RosterViewMode) => {
    const allPlayersColumns = useMemo(() => {
        return viewMode === 'Pitchers'
            ? [
                  { data: 'player.id', title: '', visible: false },
                  {
                      data: 'player.fullName',
                      title: 'Name',
                      width: '20%',
                      visible: true,
                      render: function (
                          data: string,
                          _type: string,
                          row: AllPlayersPitcher
                      ) {
                          return `<img src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${row.player.id}/headshot/silo/current" style="${IMG_STYLE}"> ${data}`;
                      },
                  },
                  {
                      data: 'team.name',
                      title: 'Team',
                      width: '20%',
                      visible: true,
                      render: function (
                          data: TeamName,
                          _type: string,
                          _row: AllPlayersPitcher
                      ) {
                          const selectedTeamLogo = data
                              ? Consts.teamInfo[data]?.logo
                              : '';
                          return `<img src="${selectedTeamLogo}" style="${IMG_STYLE}" onerror="this.style.opacity='0';"/> ${data}`;
                      },
                  },
                  { data: 'stat.gamesPlayed', title: 'GP', visible: true },
                  { data: 'stat.wins', title: 'W', visible: true },
                  { data: 'stat.losses', title: 'L', visible: true },
                  { data: 'stat.strikeOuts', title: 'SO', visible: true },
                  { data: 'stat.inningsPitched', title: 'IP', visible: true },
                  { data: 'stat.hits', title: 'H', visible: true },
                  { data: 'stat.runs', title: 'R', visible: true },
                  {
                      data: 'stat.era',
                      title: 'ERA',
                      className: 'dt-right',
                      visible: true,
                  },
                  {
                      data: 'stat.whip',
                      title: 'WHIP',
                      className: 'dt-right',
                      visible: true,
                  },
              ]
            : [
                  { data: 'player.id', title: '', visible: false },
                  {
                      data: 'player.fullName',
                      title: 'Name',
                      width: '20%',
                      visible: true,
                      render: function (data: string, _type: string, row) {
                          return `<img src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${row.player.id}/headshot/silo/current" style="${IMG_STYLE}"> ${data}`;
                      },
                  },
                  {
                      data: 'team.name',
                      title: 'Team',
                      width: '20%',
                      visible: true,
                      render: function (data: TeamName, _type: string, row) {
                          const selectedTeamLogo = data
                              ? Consts.teamInfo[data].logo
                              : '';
                          return `<img src="${selectedTeamLogo}" style="${IMG_STYLE}"/> ${data}`;
                      },
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
                  { data: 'stat.strikeOuts', title: 'SO', visible: true },
              ];
    }, [viewMode]);

    return { allPlayersColumns };
};
