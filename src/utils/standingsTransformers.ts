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
                    name: teamName,
                    teamLogo: Consts.teamsDetails[teamName].logo,
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

                    console.log(mlbTeams);
                    return [{
                        division: 'Major League Baseball',
                        teamRecords: mlbTeams
                    }];

                default:
                    return [];
            }
        case 'wild card':
            const wildCardTeams = allProcessedRecords.filter(r => r.standingsType === 'wildCard');
            console.log('wildCardTeams');
            console.log(wildCardTeams);
            console.log(allProcessedRecords);

            // add leaders
            return allProcessedRecords.filter(r => r.standingsType === 'wildCard').map((record) => ({
                division: record.league.id === 103 ? 'American League' : 'National League',
                teamRecords: record.teamRecords
            }));

        case 'spring training':
            console.log('spring training');
            return [];
        default:
            console.log(standingsMode);
            return [];
    }


};
