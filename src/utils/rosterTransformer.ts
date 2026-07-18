import { fetchPlayer } from "../services/playerService";



export const transformRoster = (rawRoster) => {

    const POSITION_ORDER = {
        'Pitcher': 1,
        'Catcher': 2,
        'Infielder': 3,
        'Outfielder': 4
    };

    const roster = rawRoster.roster.map(async (player) => {

        const rawPlayerInfo = await fetchPlayer(player.person.id);
        const playerInfo = rawPlayerInfo.people[0];

        return {
            id: player.person.id,
            name: player.person.fullName,
            position: player.position.abbreviation,
            jerseyNumber: `#${player.jerseyNumber}`,
            batThrow: `${playerInfo.batSide.code}/${playerInfo.pitchHand.code}`,
            weight: playerInfo.weight,
            height: playerInfo.height,
            age: playerInfo.currentAge,
            mlbDebut: playerInfo.mlbDebutDate,
            type: {
                display: playerInfo.primaryPosition.type,
                sort: POSITION_ORDER[playerInfo.primaryPosition.type] || 5
            }
        }
    });

    return Promise.all(roster);
}
