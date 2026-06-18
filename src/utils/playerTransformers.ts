import { fetchGame } from "../services/gamesService";


export const transformAwards = (awards: object) => {
    awards = awards.people[0].awards;
    awards = awards.reduce((acc, { name, team, date }) => {
        if (!acc[name]) {
            acc[name] = { name, teams: [], dates: [] };
        }
        acc[name].teams.push(team.teamName);
        acc[name].dates.push(date);
        return acc;
    }, {});

    awards = Object.values(awards);

    return awards;
}

export const transformPitcherStats = (rawPitcherStats: []) => {
    const pitcherStats = rawPitcherStats.flatMap((stats, _) => {
        if (!stats.people[0].stats) {
            return undefined;
        } else {
            const regularStats = stats.people[0].stats[0];
            // const advancedStats = stats.people[0].stats[1];

            return regularStats.splits.map((split) => {
                return {
                    year: split.season ?? 'Career',
                    team: split.team ? split.team.name : '',
                    stats: split.stat
                }
            })
        }
    }).filter(stats => stats !== undefined);

    return pitcherStats;
}

export const transformPitcherPitchArsenal = (rawPitcherPitchArsenal) => {

    const pitcherPitchArsenal = rawPitcherPitchArsenal.splits.map(s => {
        return {
            pitchType: s.stat.type.description,
            count: s.stat.count
        };
    });

    return pitcherPitchArsenal;
}

export const transformPitcherPitchSpeeds = (rawPitcherPitchArsenal) => {

    const pitcherPitchSpeeds = rawPitcherPitchArsenal.splits.map(s => {
        return {
            pitchType: s.stat.type.description,
            speed: Math.round(s.stat.averageSpeed * 100) / 100
        };
    }).sort((a, b) => b.speed - a.speed);

    return pitcherPitchSpeeds;
}

export const transformPitcherPitchLog = async (rawPitcherGameLog) => {
    console.log('transformPitcherPitchLog');
    console.log('rawPitcherPitchLog');
    console.log(rawPitcherGameLog);

    rawPitcherGameLog.forEach(game => {
        // console.log('gameLog');
        console.log(game);
        // const link = game.game.link;
        // console.log(link);
    });

    const seasonGames = await Promise.all(rawPitcherGameLog.map(async (game) => {
        // 1. Explicitly pause this block's execution thread until the network data is in hand
        const gameContent = await fetchGame(game.game.gamePk);

        // 2. Safely construct and hand back a cleanly resolved object literal
        return {
            gameContent: gameContent
        };
    }));

    // liveData -> allPlays -> playEvents -> isPitch: true -> pitchData
    // { gamePk: allPitches}

// }

    console.log(seasonGames);

    // const pitcherPitchLog = rawPitcherPitchLog.splits;
    // console.log(pitcherPitchLog);
    return [];
    // return rawPitcherPitchLog;
}