import { fetchGame, fetchSchedule } from "../services/gamesService";
import { scheduleFormmater } from "./dateFormatters";


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

export const transformPitcherPitchLog = async (rawPitcherGameLog, selectedPlayer) => {
    // console.log('transformPitcherPitchLog');
    // console.log('rawPitcherPitchLog');
    // console.log(rawPitcherGameLog);

    const seasonGames = await Promise.all(rawPitcherGameLog.map(async (game) => {
        const gameContent = await fetchGame(game.game.gamePk);

        return {
            gameContent: gameContent
        };
    }));

    // liveData -> allPlays -> playEvents -> isPitch: true -> pitchData
    // { gamePk: allPitches}

    // console.log('seasonGames');
    // console.log(seasonGames);

    const pitchLog = Object.fromEntries(seasonGames.map(game => {

        // console.log(game.liveData.allPlays);
        // console.log(game);
        // console.log(game.gameContent.liveData.plays.allPlays.length);
        // console.log(game.gameContent.liveData.plays.allPlays.filter(play => play.matchup.pitcher.id === selectedPlayer).length);
        // console.log(game.gameContent.liveData.plays.allPlays.filter(play => play.matchup.pitcher.id === selectedPlayer));

        const playsForGame = game.gameContent.liveData.plays.allPlays.filter(play => play.matchup.pitcher.id === selectedPlayer).map(play => {
            return {
                inning: play.about.inning,
                pitches: play.playEvents.filter(playEvent => playEvent.isPitch)
            }
        });

        // console.log('playsForGame');
        // console.log(playsForGame);

        const pitchesByInning: { [inning: number]: any[] } = {};
        playsForGame.forEach((play) => {
            const inningNum = play.inning;

            if (!pitchesByInning[inningNum]) {
                pitchesByInning[inningNum] = [];
            }

            if (play.pitches?.length) {
                pitchesByInning[inningNum].push(...play.pitches);
            }
        });

        return [game.gameContent.gamePk, pitchesByInning];
    }));

    return pitchLog;
}

export const transformPitcherGameLog = async (rawPitcherGameLog) => {

    const gameLog = await Promise.all(rawPitcherGameLog.toReversed().map(async game => {

        const gameDate = scheduleFormmater.format(new Date(game.date));
        const gameSchedule = await fetchSchedule(gameDate, gameDate);
        const currGame = gameSchedule.dates[0].games.filter(scheduledGame => scheduledGame.gamePk === game.game.gamePk)[0];

        return {
            gamePk: game.game.gamePk,
            gameMetadata: {
                tickets: currGame.tickets?.[0]?.ticketLinks?.home,
                broadcasts: currGame.broadcasts.filter(b => b.type === 'TV').map(b => b.name),
                seriesStatus: currGame.seriesStatus
            },
            date: scheduleFormmater.format(new Date(game.date)),
            matchup: game.isHome ? [game.opponent.name, game.team.name] : [game.team.name, game.opponent.name],
            isWin: game.isWin,
            pitches: game.stat.numberOfPitches,
            inningsPitched: game.stat.inningsPitched,
            earnedRuns: game.stat.earnedRuns,
            earnedRunAverage: game.stat.era,
            hits: game.stat.hits,
            runs: game.stat.runs,
            strikeouts: game.stat.strikeOuts,
            walks: game.stat.baseOnBalls,
            whip: game.stat.whip
        }
    }));

    return gameLog;
}