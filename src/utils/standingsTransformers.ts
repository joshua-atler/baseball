import { Consts } from "../consts/consts";
import { fetchDivision } from "../services/standingsService";
import { fetchTeamDetails } from "../services/teamsService";


export const transformStandingsForBoxscore = (standingsJson: object, awayTeamID: number, homeTeamID: number) => {
    const allTeamRecords = standingsJson.records.flatMap(division => division.teamRecords);
    const awayTeamRecord = allTeamRecords.find(x => x.team.id === awayTeamID);
    const homeTeamRecord = allTeamRecords.find(x => x.team.id === homeTeamID);

    const awayTeamWinsLosses = `${awayTeamRecord.leagueRecord.wins}-${awayTeamRecord.leagueRecord.losses}`;
    const homeTeamWinsLosses = `${homeTeamRecord.leagueRecord.wins}-${homeTeamRecord.leagueRecord.losses}`;

    return [awayTeamWinsLosses, homeTeamWinsLosses];
};

export const transformStandings = async (standingsJson, standingsMode, groupingsMode) => {

    const allProcessedRecords = await Promise.all(standingsJson.records.map(async (record) => {
        const updatedTeamRecords = await Promise.all(record.teamRecords.map(async (teamRec) => {
            const teamName = (await fetchTeamDetails(teamRec.team.id))?.teams?.[0]?.name;
            return {
                ...teamRec,
                team: {
                    ...teamRec.team,
                    name: teamName,
                    teamLogo: Consts.teamInfo[teamName].logo,
                }
            };
        }));
        return { ...record, teamRecords: updatedTeamRecords };
    }));

    switch (standingsMode) {
        case 'regular season':
            switch (groupingsMode) {
                case 'division':
                    return Promise.all(allProcessedRecords.map(async (record) => ({
                        division: (await fetchDivision(record.division.id))?.divisions?.[0]?.nameShort || "Unknown",
                        teamRecords: record.teamRecords
                    })));

                case 'league':
                    const americanLeagueTeams = allProcessedRecords.filter(r => r.league.id === 103).flatMap(r => r.teamRecords)
                        .sort((a, b) => parseInt(a.leagueRank) - parseInt(b.leagueRank));
                    const nationalLeagueTeams = allProcessedRecords.filter(r => r.league.id === 104).flatMap(r => r.teamRecords)
                        .sort((a, b) => parseInt(a.leagueRank) - parseInt(b.leagueRank));

                    return [
                        {
                            division: 'American League',
                            teamRecords: americanLeagueTeams
                        },
                        {
                            division: 'National League',
                            teamRecords: nationalLeagueTeams
                        },
                    ];

                case 'MLB':
                    const mlbTeams = allProcessedRecords.flatMap(r => r.teamRecords);
                    mlbTeams.sort((a, b) => parseInt(a.sportRank) - parseInt(b.sportRank));

                    return [{
                        division: 'Major League Baseball',
                        teamRecords: mlbTeams
                    }];

                default:
                    return [];
            }
        case 'wild card':
            const wildCardTeams = allProcessedRecords.filter(r => r.standingsType === 'wildCard').map((record) => ({
                division: record.league.id === 103 ? 'American League' : 'National League',
                teamRecords: record.teamRecords
            }));
            const divisionLeaders = await Promise.all(allProcessedRecords.filter(r => r.standingsType === 'divisionLeaders').map(async (record) => ({
                division: (await fetchDivision(record.division.id))?.divisions?.[0]?.nameShort || "Unknown",
                teamRecords: record.teamRecords
            })));

            const allWildCardTeams = [...divisionLeaders, ...wildCardTeams];
            const order = ['AL East', 'AL Central', 'AL West', 'American League', 'NL East', 'NL Central', 'NL West', 'National League'];
            const orderMap = new Map(order.map((value, index) => [value, index]));

            const sortedAllWildCardTeams = allWildCardTeams.sort((a, b) => {
                return (orderMap.get(a.division) ?? Infinity) - (orderMap.get(b.division) ?? Infinity);
            });

            return sortedAllWildCardTeams;

        case 'spring training':

            const grapefruitLeagueTeams = allProcessedRecords
                .map(division => ({
                    ...division,
                    teamRecords: division.teamRecords.filter(r =>
                        r.team?.springLeague?.id === 115
                    )
                }))
                .filter(division => division.teamRecords.length > 0)
                .flatMap(r => r.teamRecords)
                .sort((a, b) => parseInt(a.springLeagueRank) - parseInt(b.springLeagueRank));
            const cactusLeagueTeams = allProcessedRecords
                .map(division => ({
                    ...division,
                    teamRecords: division.teamRecords.filter(r =>
                        r.team?.springLeague?.id === 114
                    )
                }))
                .filter(division => division.teamRecords.length > 0)
                .flatMap(r => r.teamRecords)
                .sort((a, b) => parseInt(a.springLeagueRank) - parseInt(b.springLeagueRank));

            return [
                {
                    division: 'Grapefruit League',
                    teamRecords: grapefruitLeagueTeams
                },
                {
                    division: 'Cactus League',
                    teamRecords: cactusLeagueTeams
                }
            ];
        default:
            return [];
    }
};

export const transformLineChartStandings = async (scheduleJson, standingsMode, groupingsMode) => {

    const runningScores = {};
    Object.keys(Consts.teamInfo).filter(t => t !== 'Oakland Athletics').forEach(team => {
        runningScores[team] = 0;
    });

    const teamRecordsByDate = scheduleJson.dates.map((date) => {

        date.games.forEach(game => {
            if (game.status.abstractGameState !== 'Final') return;
            const homeTeam = game.teams.home.team.name;
            const awayTeam = game.teams.away.team.name;
            const homeScore = game.teams.home.score;
            const awayScore = game.teams.away.score;

            if (homeScore > awayScore) {
                runningScores[homeTeam] += 1;
                runningScores[awayTeam] -= 1;
            } else if (awayScore > homeScore) {
                runningScores[awayTeam] += 1;
                runningScores[homeTeam] -= 1;
            }
        });

        return {
            date: `${date.date.split('-')[1]}/${date.date.split('-')[2]}`,
            ...runningScores
        };
    });


    switch (groupingsMode) {

        case 'division':
            const divisionConfigs = [
                { name: 'AL East', league: 'AL', index: 0 },
                { name: 'AL Central', league: 'AL', index: 1 },
                { name: 'AL West', league: 'AL', index: 2 },
                { name: 'NL East', league: 'NL', index: 0 },
                { name: 'NL Central', league: 'NL', index: 1 },
                { name: 'NL West', league: 'NL', index: 2 },
            ];

            return divisionConfigs.map(({ name, league, index }) => {
                const allowedTeams = new Set([...Consts.teams[league][index], 'date']);

                return {
                    division: name,
                    teamRecords: teamRecordsByDate.map(row =>
                        Object.fromEntries(
                            Object.entries(row).filter(([key]) => allowedTeams.has(key))
                        )
                    )
                };
            });
        case 'league':
            const americanLeagueTeams = new Set([...Consts.teams.AL.flat(), 'date']);
            const nationalLeagueTeams = new Set([...Consts.teams.NL.flat(), 'date']);

            return [
                {
                    division: 'American League',
                    teamRecords: teamRecordsByDate.map(row => {
                        return Object.fromEntries(
                            Object.entries(row).filter(([key]) =>
                                key === 'date' || americanLeagueTeams.has(key)
                            )
                        );
                    })
                },
                {
                    division: 'National League',
                    teamRecords: teamRecordsByDate.map(row => {
                        return Object.fromEntries(
                            Object.entries(row).filter(([key]) =>
                                key === 'date' || nationalLeagueTeams.has(key)
                            )
                        );
                    })
                }
            ];
        case 'MLB':
            return [{
                division: 'Major League Baseball',
                teamRecords: teamRecordsByDate
            }];
    }

    return [];
};
