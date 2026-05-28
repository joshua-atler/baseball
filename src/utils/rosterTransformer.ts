import { fetchPlayer } from "../services/playerService";



export const transformRoster = (rawRoster) => {
    // console.log('transformRoster');
    // console.log(rawRoster);

    const roster = rawRoster.roster.map(async (player) => {

        // console.log('player');
        // console.log(player);

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
            type: playerInfo.primaryPosition.type
        }
    });


    return roster;
}
