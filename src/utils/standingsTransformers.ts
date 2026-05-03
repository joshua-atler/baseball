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

export const transformStandings = async (standingsJson) => {


    const standingsPromises = standingsJson.records.map(async (record, i) => {
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

        return {
            division: (await fetchDivision(record.division.id))?.divisions?.[0]?.nameShort || "Unknown",
            teamRecords: updatedTeamRecords
        }
    });

    const standings = await Promise.all(standingsPromises);

    // let standings: any[] = [];

    // const standings = [
    //     [
    //         {
    //             team: 'Yankees',
    //             wins: 20,
    //             losses: 15,
    //             gamesBack: 4,
    //             homeRecord: '4-5',
    //             awayRecord: '8-6',
    //             runsScored: 30,
    //             runsAllowed: 20,
    //             streak: 'W3',
    //             last10: '5-5'
    //         },
    //         {
    //             team: 'Orioles',
    //             wins: 20,
    //             losses: 15,
    //             gamesBack: 4,
    //             homeRecord: '4-5',
    //             awayRecord: '8-6',
    //             runsScored: 30,
    //             runsAllowed: 20,
    //             streak: 'W3',
    //             last10: '5-5'
    //         }
    //     ],
    //     [
    //         {
    //             team: 'Tigers',
    //             wins: 20,
    //             losses: 15,
    //             gamesBack: 4,
    //             homeRecord: '4-5',
    //             awayRecord: '8-6',
    //             runsScored: 30,
    //             runsAllowed: 20,
    //             streak: 'W3',
    //             last10: '5-5'
    //         }
    //     ]
    // ];

    // console.log(standings);

    // let standings = Array.from({length: 6}, ()=>[]);

    // const allTeamRecords = standingsJson.records.flatMap(division => division.teamRecords);
    // const awayTeamRecord = allTeamRecords.find(x => x.team.id === awayTeamID);
    // const homeTeamRecord = allTeamRecords.find(x => x.team.id === homeTeamID);

    // const awayTeamWinsLosses = `${awayTeamRecord.leagueRecord.wins}-${awayTeamRecord.leagueRecord.losses}`;
    // const homeTeamWinsLosses = `${homeTeamRecord.leagueRecord.wins}-${homeTeamRecord.leagueRecord.losses}`;

    // return [awayTeamWinsLosses, homeTeamWinsLosses];

    return standings;
};
