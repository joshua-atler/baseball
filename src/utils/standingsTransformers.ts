import { Consts } from '../consts/consts';
import { fetchDivision } from '../services/standingsService';
import { fetchTeamDetails } from '../services/teamsService';
import {
    FormattedStandings,
    GroupingsMode,
    LineChartDataset,
    StandingsForBoxscore,
    StandingsMode,
    TeamRecord,
} from '../types/standings';

export const transformStandingsForBoxscore = (
    standingsJson: any,
    awayTeamID: number,
    homeTeamID: number
): StandingsForBoxscore => {
    const allTeamRecords = standingsJson.records.flatMap(
        (division) => division.teamRecords
    );
    const awayTeamRecord = allTeamRecords.find((x) => x.team.id === awayTeamID);
    const homeTeamRecord = allTeamRecords.find((x) => x.team.id === homeTeamID);

    const awayTeamWinsLosses = `${awayTeamRecord.leagueRecord.wins}-${awayTeamRecord.leagueRecord.losses}`;
    const homeTeamWinsLosses = `${homeTeamRecord.leagueRecord.wins}-${homeTeamRecord.leagueRecord.losses}`;

    const standingsForBoxscore: StandingsForBoxscore = [
        awayTeamWinsLosses,
        homeTeamWinsLosses,
    ];

    return standingsForBoxscore;
};

export const transformStandings = async (
    standingsJson: any,
    standingsMode: StandingsMode,
    groupingsMode: GroupingsMode
): Promise<FormattedStandings[]> => {
    if (!standingsJson?.records) return [];

    const allProcessedRecords = await Promise.all(
        standingsJson.records.map(async (record: any) => {
            const updatedTeamRecords = await Promise.all(
                (record.teamRecords || []).map(
                    async (teamRec: any): Promise<TeamRecord> => {
                        const teamDetails = await fetchTeamDetails(
                            teamRec.team.id
                        );
                        const teamName =
                            teamDetails?.teams?.[0]?.name || 'Unknown Team';

                        return {
                            ...teamRec,
                            team: {
                                ...teamRec.team,
                                name: teamName,
                                teamLogo: Consts.teamInfo[teamName]?.logo || '',
                            },
                        };
                    }
                )
            );
            return { ...record, teamRecords: updatedTeamRecords };
        })
    );

    switch (standingsMode) {
        case 'regular season':
            switch (groupingsMode) {
                case 'division':
                    return Promise.all(
                        allProcessedRecords.map(
                            async (
                                record: any
                            ): Promise<FormattedStandings> => {
                                const divisionData = await fetchDivision(
                                    record.division.id
                                );
                                return {
                                    division:
                                        divisionData?.divisions?.[0]
                                            ?.nameShort || 'Unknown',
                                    teamRecords: record.teamRecords,
                                };
                            }
                        )
                    );

                case 'league': {
                    const americanLeagueTeams = allProcessedRecords
                        .filter((r) => r.league?.id === 103)
                        .flatMap((r) => r.teamRecords)
                        .toSorted(
                            (a, b) =>
                                parseInt(a.leagueRank || '0') -
                                parseInt(b.leagueRank || '0')
                        );

                    const nationalLeagueTeams = allProcessedRecords
                        .filter((r) => r.league?.id === 104)
                        .flatMap((r) => r.teamRecords)
                        .toSorted(
                            (a, b) =>
                                parseInt(a.leagueRank || '0') -
                                parseInt(b.leagueRank || '0')
                        );

                    return [
                        {
                            division: 'American League',
                            teamRecords: americanLeagueTeams,
                        },
                        {
                            division: 'National League',
                            teamRecords: nationalLeagueTeams,
                        },
                    ];
                }

                case 'MLB': {
                    const mlbTeams = allProcessedRecords
                        .flatMap((r) => r.teamRecords)
                        .toSorted(
                            (a, b) =>
                                parseInt(a.sportRank || '0') -
                                parseInt(b.sportRank || '0')
                        );

                    return [
                        {
                            division: 'Major League Baseball',
                            teamRecords: mlbTeams,
                        },
                    ];
                }

                default:
                    return [];
            }

        case 'wild card': {
            const wildCardTeams = allProcessedRecords
                .filter((r) => r.standingsType === 'wildCard')
                .map((record: any): FormattedStandings => ({
                    division:
                        record.league?.id === 103
                            ? 'American League'
                            : 'National League',
                    teamRecords: record.teamRecords,
                }));

            const divisionLeaders = await Promise.all(
                allProcessedRecords
                    .filter((r) => r.standingsType === 'divisionLeaders')
                    .map(async (record: any): Promise<FormattedStandings> => {
                        const divisionData = await fetchDivision(
                            record.division.id
                        );
                        return {
                            division:
                                divisionData?.divisions?.[0]?.nameShort ||
                                'Unknown',
                            teamRecords: record.teamRecords,
                        };
                    })
            );

            const allWildCardTeams = [...divisionLeaders, ...wildCardTeams];
            const order = [
                'AL East',
                'AL Central',
                'AL West',
                'American League',
                'NL East',
                'NL Central',
                'NL West',
                'National League',
            ];
            const orderMap = new Map(
                order.map((value, index) => [value, index])
            );

            return allWildCardTeams.toSorted((a, b) => {
                return (
                    (orderMap.get(a.division) ?? Infinity) -
                    (orderMap.get(b.division) ?? Infinity)
                );
            });
        }

        case 'spring training': {
            const grapefruitLeagueTeams = allProcessedRecords
                .map((division) => ({
                    ...division,
                    teamRecords: division.teamRecords.filter(
                        (r) => r.team?.springLeague?.id === 115
                    ),
                }))
                .filter((division) => division.teamRecords.length > 0)
                .flatMap((r) => r.teamRecords)
                .toSorted(
                    (a, b) =>
                        parseInt(a.springLeagueRank || '0') -
                        parseInt(b.springLeagueRank || '0')
                );

            const cactusLeagueTeams = allProcessedRecords
                .map((division) => ({
                    ...division,
                    teamRecords: division.teamRecords.filter(
                        (r) => r.team?.springLeague?.id === 114
                    ),
                }))
                .filter((division) => division.teamRecords.length > 0)
                .flatMap((r) => r.teamRecords)
                .toSorted(
                    (a, b) =>
                        parseInt(a.springLeagueRank || '0') -
                        parseInt(b.springLeagueRank || '0')
                );

            return [
                {
                    division: 'Grapefruit League',
                    teamRecords: grapefruitLeagueTeams,
                },
                { division: 'Cactus League', teamRecords: cactusLeagueTeams },
            ];
        }

        default:
            return [];
    }
};

export const transformLineChartStandings = (
    scheduleJson: any,
    groupingsMode: GroupingsMode
): LineChartDataset[] => {
    if (!scheduleJson?.dates) return [];

    const runningScores: Record<string, number> = {};
    Object.keys(Consts.teamInfo)
        .filter((t) => t !== 'Oakland Athletics')
        .forEach((team) => {
            runningScores[team] = 0;
        });

    const teamRecordsByDate = scheduleJson.dates.map((date: any) => {
        (date.games || []).forEach((game: any) => {
            if (game.status?.abstractGameState !== 'Final') return;

            const homeTeam = game.teams?.home?.team?.name;
            const awayTeam = game.teams?.away?.team?.name;
            const homeScore = game.teams?.home?.score ?? 0;
            const awayScore = game.teams?.away?.score ?? 0;

            if (
                homeTeam &&
                awayTeam &&
                homeTeam in runningScores &&
                awayTeam in runningScores
            ) {
                if (homeScore > awayScore) {
                    runningScores[homeTeam] += 1;
                    runningScores[awayTeam] -= 1;
                } else if (awayScore > homeScore) {
                    runningScores[awayTeam] += 1;
                    runningScores[homeTeam] -= 1;
                }
            }
        });

        const [year, month, day] = date.date.split('-');

        return {
            date: `${month}/${day}`,
            ...{ ...runningScores },
        };
    });

    switch (groupingsMode) {
        case 'division': {
            const divisionConfigs = [
                { name: 'AL East', league: 'AL', index: 0 },
                { name: 'AL Central', league: 'AL', index: 1 },
                { name: 'AL West', league: 'AL', index: 2 },
                { name: 'NL East', league: 'NL', index: 0 },
                { name: 'NL Central', league: 'NL', index: 1 },
                { name: 'NL West', league: 'NL', index: 2 },
            ];

            return divisionConfigs.map(({ name, league, index }) => {
                const allowedTeams = new Set([
                    ...(Consts.teams[league]?.[index] || []),
                    'date',
                ]);

                return {
                    division: name,
                    teamRecords: teamRecordsByDate.map((row) =>
                        Object.fromEntries(
                            Object.entries(row).filter(([key]) =>
                                allowedTeams.has(key)
                            )
                        )
                    ),
                };
            });
        }

        case 'league': {
            const americanLeagueTeams = new Set([
                ...(Consts.teams.AL || []).flat(),
                'date',
            ]);
            const nationalLeagueTeams = new Set([
                ...(Consts.teams.NL || []).flat(),
                'date',
            ]);

            return [
                {
                    division: 'American League',
                    teamRecords: teamRecordsByDate.map((row) =>
                        Object.fromEntries(
                            Object.entries(row).filter(([key]) =>
                                americanLeagueTeams.has(key)
                            )
                        )
                    ),
                },
                {
                    division: 'National League',
                    teamRecords: teamRecordsByDate.map((row) =>
                        Object.fromEntries(
                            Object.entries(row).filter(([key]) =>
                                nationalLeagueTeams.has(key)
                            )
                        )
                    ),
                },
            ];
        }

        case 'MLB':
            return [
                {
                    division: 'Major League Baseball',
                    teamRecords: teamRecordsByDate,
                },
            ];

        default:
            return [];
    }
};
