

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
                    team: split.team ? split.team.name: '',
                    stats: split.stat
                }
            })
        }
    }).filter(stats => stats !== undefined);

    return pitcherStats;
}