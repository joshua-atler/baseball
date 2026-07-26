import { TimeZone } from "../context/BasedashContext";
import { Consts } from "../consts/consts";
import { shortYearFormatter } from "./dateFormatters";


export const transformGames = async (gamesJson, isLiveGames: boolean, selectedTeams: string, timeZone: TimeZone, onProgress) => {
    let gamesForDates = [];
    for (let i = 0; i < gamesJson.dates.length; i++) {
        for (let j = 0; j < gamesJson.dates[i].games.length; j++) {
            if (isLiveGames && gamesJson.dates[i].games[j].status.abstractGameState != 'Live') {
                // skip
            } else {
                if (selectedTeams.length === 0) {
                    gamesForDates.push(gamesJson.dates[i].games[j]);
                } else {
                    const awayTeam = gamesJson.dates[i].games[j].teams.away.team.name;
                    const homeTeam = gamesJson.dates[i].games[j].teams.home.team.name;

                    if (selectedTeams.includes(awayTeam) || selectedTeams.includes(homeTeam)) {
                        gamesForDates.push(gamesJson['dates'][i]['games'][j]);
                    }
                }
            }
        }
    }

    let gamesList = [];
    for (let i = 0; i < gamesForDates.length; i++) {
        if (gamesForDates[i]['status']['detailedState'] != 'Suspended') {
            gamesList.push(gamesForDates[i]['gamePk']);
        }
    }

    let progressAmount = 0;

    const gamePromises = gamesForDates.map(async (game) => {

        const url = 'https://statsapi.mlb.com' + game['link'];

        const res = await fetch(url);
        const gameResponse = await res.json();

        let now = new Date();
        let dateString = new Date(gameResponse['gameData']['datetime']['dateTime']).toLocaleDateString('en-US');
        let time = new Date(gameResponse['gameData']['datetime']['dateTime']);

        time.setHours(time.getHours() + Consts.timeZoneOffset[timeZone]);

        let timeString = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        let awayScore = '-';
        let awayTeam = gameResponse['gameData']['teams']['away']['name'];
        let homeScore = '-';
        let homeTeam = gameResponse['gameData']['teams']['home']['name'];
        let inningData = '';
        let outs = '';
        let count = '';
        let status = gameResponse['gameData']['status']['abstractGameState'];
        let started = time < now;

        let homeWin = false;

        if (gameResponse['liveData']['linescore']['currentInning'] !== undefined && status == 'Live') {
            let inningState = gameResponse['liveData']['linescore']['inningState'].substring(0, 3);
            inningData = inningState + ' ' + gameResponse['liveData']['linescore']['currentInning'].toString();
            outs = gameResponse['liveData']['linescore']['outs'];
            outs = '<span style="color: #EFB21F">&#11044;</span>'.repeat(outs) + '<span style="color: #888888">&#11044;</span>'.repeat(3 - outs);
            count = gameResponse['liveData']['linescore']['balls'].toString() + '-' + gameResponse['liveData']['linescore']['strikes'].toString();

            const runners = gameResponse['liveData']['linescore']['offense'];
            let bases = ['third', 'second', 'first'];
            let baseData = [];
            for (let base of bases) {
                if (base in runners) {
                    baseData.push(['#EFB21F', '#EFB21F']);
                } else {
                    baseData.push(['#888888', '#AAAAAA']);
                }
            }
            bases = `<svg class="svg" width="35" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16.25" aria-label="base"><title>Bases.</title>
                <rect fill="${baseData[0][0]}" stroke-width="1" stroke="${baseData[0][1]}" width="6" height="6" transform="translate(5, 7.25) rotate(-315)" rx="1px" ry="1px"></rect>
                <rect fill="${baseData[1][0]}" stroke-width="1" stroke="${baseData[1][1]}" width="6" height="6" transform="translate(12, 0.5) rotate(-315)" rx="1px" ry="1px"></rect>
                <rect fill="${baseData[2][0]}" stroke-width="1" stroke="${baseData[2][1]}" width="6" height="6" transform="translate(19, 7.25) rotate(-315)" rx="1px" ry="1px"></rect>
                </svg>`;

            inningData = '<span class="inning-num">' + inningData + '</span>';
            inningData = inningData + bases + '&nbsp;' + outs + '&nbsp;' + count;
            inningData = '<span class="svg-span">' + inningData + '</span>';
        }

        let detailedState = gameResponse['gameData']['status']['detailedState'];
        if (status != 'Preview' && started) {
            if (gameResponse['liveData']['linescore']['teams']['away']['runs'] !== undefined) {
                awayScore = gameResponse['liveData']['linescore']['teams']['away']['runs'];
            }
            if (gameResponse['liveData']['linescore']['teams']['home']['runs'] !== undefined) {
                homeScore = gameResponse['liveData']['linescore']['teams']['home']['runs'];
            }
        }
        if (status != 'Preview' && !started) {
            status = 'Preview';
        }

        if (status == 'Final' && detailedState == 'Final') {
            if (homeScore > awayScore) {
                homeWin = true;
                homeScore = `<span style="font-weight: bold;">${homeScore.toString()} &#9664;</span>`;
            } else if (awayScore > homeScore) {
                homeWin = false;
                awayScore = `<span style="font-weight: bold;">${awayScore.toString()} &#9664;</span>`;
            }
        } else {
            status = detailedState;
        }

        const currGame = {
            gamePk: '',
            gameMetadata: {
                tickets: '',
                seriesStatus: {},
                broadcasts: {}
            },
            date: '',
            time: '',
            away: '',
            awayScore: '',
            home: '',
            homeScore: '',
            inning: '',
            status: ''
        };
        currGame.gamePk = gameResponse.gamePk;
        currGame.date = dateString;
        currGame.time = timeString;
        if (awayTeam in Consts.teamInfo) {
            currGame.away = `<img width="30" height="30" style="vertical-align: middle; margin-right: 5px;" src="${Consts.teamInfo[awayTeam].logo}"><span>${awayTeam}</span>`;
        } else {
            currGame.away = awayTeam;
        }
        currGame.awayScore = awayScore;
        if (homeTeam in Consts.teamInfo) {
            currGame.home = `<img width="30" height="30" style="vertical-align: middle; margin-right: 5px;" src="${Consts.teamInfo[homeTeam].logo}"><span>${homeTeam}</span>`;
        } else {
            currGame.home = homeTeam;
        }
        currGame.homeScore = homeScore;

        if (status == 'Final') {
            if (homeWin) {
                currGame.home = `<span style="font-weight: bold;">${currGame.home}</span>`
                currGame.away = `<span style="color: #aaaaaa;">${currGame.away}</span>`
                currGame.awayScore = `<span style="color: #aaaaaa;">${currGame.awayScore}</span>`;
            } else {
                currGame.away = `<span style="font-weight: bold;">${currGame.away}</span>`;
                currGame.home = `<span style="color: #aaaaaa;">${currGame.home}</span>`;
                currGame.homeScore = `<span style="color: #aaaaaa;">${currGame.homeScore}</span>`;
            }
        }

        currGame.inning = inningData;
        currGame.status = status;

        currGame.gameMetadata.tickets = game.tickets?.[0]?.ticketLinks?.home;
        currGame.gameMetadata.broadcasts = game.broadcasts.filter(b => b.type === 'TV').map(b => b.name);
        currGame.gameMetadata.seriesStatus = game.seriesStatus;

        progressAmount++;
        if (onProgress) {
            onProgress(100 * progressAmount / gamesForDates.length);
        }

        return currGame;
    });

    const allGames = await Promise.all(gamePromises);


    return allGames;
};

export const transformGameArticle = (content) => {

    if (Object.keys(content?.editorial).length === 0) {
        return null;
    }

    const editorial = content?.editorial?.recap?.mlb;
    const authors = editorial.contributors?.flatMap(c => c.name);

    const article = {
        headline: '',
        author: '',
        date: '',
        imageURL: '',
        body: '',
        slug: '',
    };

    article.headline = editorial?.headline;
    article.author = (Object.keys(editorial?.contributors?.[0]).length > 0) ? authors.join(', ') : '';
    article.imageURL = editorial?.photo?.cuts?.[0].src;
    article.date = shortYearFormatter.format(new Date(editorial?.date));
    article.body = editorial?.body;
    article.slug = editorial?.slug;

    return article;
}


export const transformGameMedia = (content) => {

    const highlights = content?.highlights?.highlights?.items;

    if (!highlights) {
        return null;
    }

    interface Media {
        title: string,
        imageURL: string,
        videoURL: string
    }

    const media: Media[] = [];

    highlights.forEach(highlight => {
        media.push({
            title: highlight?.title,
            imageURL: highlight?.image?.cuts?.[0]?.src,
            videoURL: highlight?.playbacks?.[0]?.url
        });
    });


    return media;
}

export const transformGameStats = (gameContent) => {

    const awayTeamName = gameContent?.liveData?.boxscore?.teams?.away?.team?.name;
    const homeTeamName = gameContent?.liveData?.boxscore?.teams?.home?.team?.name;
    const awayTeam = Consts.teamInfo[awayTeamName];
    const homeTeam = Consts.teamInfo[homeTeamName];

    const awayStats = gameContent?.liveData?.boxscore?.teams?.away?.teamStats;
    const homeStats = gameContent?.liveData?.boxscore?.teams?.home?.teamStats;

    const gameStats = {
        away: {
            team: awayTeam,
            stats: awayStats,
        },
        home: {
            team: homeTeam,
            stats: homeStats
        }
    };

    return gameStats;
}

export const transformGamePlays = (playsContent) => {
    // console.log('transformGamePlays');


    // organize returned data into innings and plays

    const playsByInning = playsContent?.liveData?.plays?.playsByInning;
    const allPlays = playsContent?.liveData?.plays?.allPlays;

    if (allPlays.length === 0) {
        return [];
    }

    const formattedPlays = [];
    // relevant play data in each half inning

    const awayAbbr = playsContent?.gameData?.teams?.away?.abbreviation;
    const homeAbbr = playsContent?.gameData?.teams?.home?.abbreviation;

    for (let i = 0; i < playsByInning.length; i++) {
        const inning = playsByInning[i];

        if (inning.top.length > 0) {
            // const topPlays = inning.top;
            const topPlays = allPlays.slice(inning.top.at(0), inning.top.at(-1) + 1);
            formattedPlays.push({
                inningNum: i + 1,
                half: 'Top',
                teamAbbr: awayAbbr,
                plays: topPlays
            });
        }
        if (inning.bottom.length > 0) {
            const bottomPlays = allPlays.slice(inning.bottom.at(0), inning.bottom.at(-1) + 1);
            formattedPlays.push({
                inningNum: i + 1,
                half: 'Bottom',
                teamAbbr: homeAbbr,
                plays: bottomPlays
            });
        }
    }

    // console.log('playsByInning');
    // console.log(playsByInning);
    // console.log('formattedPlays');
    // console.log(formattedPlays);

    return formattedPlays;
}
