import { Consts } from "../consts/consts";

export const transformPlayerData = async (playerArray) => {
    const POSITION_ORDER = {
        'Pitcher': 1,
        'Hitter': 2
    };

    if (!playerArray || playerArray.length === 0) return [];

    const promiseArray = playerArray.roster.map(async (player) => {
        const displayType = player.primaryPosition.type === 'Pitcher' ? 'Pitcher' : 'Hitter';

        const currentTeam = Object.keys(Object.fromEntries(
            Object.entries(Consts.teamInfo).filter(([key, value]) => value.id === player.currentTeam.id)
        ))[0];

        return {
            id: player.id,
            team: currentTeam,
            name: player.fullName,
            position: player.primaryPosition.abbreviation,
            jerseyNumber: player.primaryNumber ? `${player.primaryNumber}` : 'N/A',
            batThrow: player.batSide.code,
            weight: player.weight,
            height: player.height,
            age: player.currentAge,
            mlbDebut: player.mlbDebutDate,
            type: {
                display: displayType,
                sort: POSITION_ORDER[player.primaryPosition.type] || 3
            }
        }
    });

    return Promise.all(promiseArray);
};
