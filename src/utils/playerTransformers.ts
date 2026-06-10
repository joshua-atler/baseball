

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