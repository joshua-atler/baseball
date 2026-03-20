import { TimeZone } from "../context/BasedashContext";
import { Consts } from "../consts/consts";


export const transformGames = async (gamesJson, isLiveGames: boolean, selectedTeams: string[], timeZone: TimeZone, onProgress) => {
    console.log(`isLiveGames: ${isLiveGames}`);
    let gamesForDates = [];
    for (let i = 0; i < gamesJson['dates'].length; i++) {
        console.log(`i: ${i}`);
        for (let j = 0; j < gamesJson['dates'][i]['games'].length; j++) {
            if (isLiveGames && gamesJson['dates'][i]['games'][j]['status']['abstractGameState'] != 'Live') {
                // skip
            } else {
                if (selectedTeams.length === 0) {
                    gamesForDates.push(gamesJson['dates'][i]['games'][j]);
                } else {
                    const awayTeam = Consts.teamNameToKey[gamesJson['dates'][i]['games'][j]['teams']['away']['team']['name']];
                    const homeTeam = Consts.teamNameToKey[gamesJson['dates'][i]['games'][j]['teams']['home']['team']['name']];

                    if (selectedTeams.includes(awayTeam) || selectedTeams.includes(homeTeam)) {
                        gamesForDates.push(gamesJson['dates'][i]['games'][j]);
                    }
                }
            }
        }
    }

    console.log('gamesForDates');
    console.log(gamesForDates);

    let gamesList = [];
    for (let i = 0; i < gamesForDates.length; i++) {
        if (gamesForDates[i]['status']['detailedState'] != 'Suspended') {
            gamesList.push(gamesForDates[i]['gamePk']);
        }
    }

    console.log('gamesList');
    console.log(gamesList);
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
            'date': '',
            'time': '',
            'away': '',
            'awayScore': '',
            'home': '',
            'homeScore': '',
            'inning': '',
            'status': ''
        };
        currGame['date'] = dateString;
        currGame['time'] = timeString;
        if (awayTeam in Consts.teamsDetails) {
            currGame['away'] = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[awayTeam].logo}"><span>${awayTeam}</span>`;
        } else {
            currGame['away'] = awayTeam;
        }
        currGame['awayScore'] = awayScore;
        if (homeTeam in Consts.teamsDetails) {
            currGame['home'] = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[homeTeam].logo}"><span>${homeTeam}</span>`;
        } else {
            currGame['home'] = homeTeam;
        }
        currGame['homeScore'] = homeScore;

        if (status == 'Final') {
            if (homeWin) {
                currGame['home'] = `<span style="font-weight: bold;">${currGame['home']}</span>`
                currGame['away'] = `<span style="color: #aaaaaa;">${currGame['away']}</span>`
                currGame['awayScore'] = `<span style="color: #aaaaaa;">${currGame['awayScore']}</span>`;
            } else {
                currGame['away'] = `<span style="font-weight: bold;">${currGame['away']}</span>`;
                currGame['home'] = `<span style="color: #aaaaaa;">${currGame['home']}</span>`;
                currGame['homeScore'] = `<span style="color: #aaaaaa;">${currGame['homeScore']}</span>`;
            }
        }

        currGame['inning'] = inningData;
        currGame['status'] = status;

        return currGame;
    });

    const allGames = await Promise.all(gamePromises);

    progressAmount++;
    if (onProgress) {
        console.log('setting progress');
        onProgress(100 * progressAmount / gamesForDates.length);
    }

    return allGames;

    // for (let i = 0; i < gamesForDates.length; i++) { // group together with promises
    //     let url = gamesForDates[i]['link'];

    //     const gameResponse = await fetch('https://statsapi.mlb.com' + url);
    //     const data = await gameResponse.json();
    //     let row_i = gamesList.indexOf(data['gameData']['game']['pk']);
    //     gamesDetails[row_i] = data;

    //     // let now = new Date();
    //     // let dateString = new Date(data['gameData']['datetime']['dateTime']).toLocaleDateString('en-US');
    //     // let time = new Date(data['gameData']['datetime']['dateTime']);

    //     // time.setHours(time.getHours() + Consts.timeZoneOffset[timeZone]);

    //     // let timeString = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    //     // let awayScore = '-';
    //     // let awayTeam = data['gameData']['teams']['away']['name'];
    //     // let homeScore = '-';
    //     // let homeTeam = data['gameData']['teams']['home']['name'];
    //     // let inningData = '';
    //     // let outs = '';
    //     // let count = '';
    //     // let status = data['gameData']['status']['abstractGameState'];
    //     // let started = time < now;

    //     // let homeWin = false;

    //     // if (data['liveData']['linescore']['currentInning'] !== undefined && status == 'Live') {
    //     //     let inningState = data['liveData']['linescore']['inningState'].substring(0, 3);
    //     //     inningData = inningState + ' ' + data['liveData']['linescore']['currentInning'].toString();
    //     //     outs = data['liveData']['linescore']['outs'];
    //     //     outs = '<span style="color: #EFB21F">&#11044;</span>'.repeat(outs) + '<span style="color: #888888">&#11044;</span>'.repeat(3 - outs);
    //     //     count = data['liveData']['linescore']['balls'].toString() + '-' + data['liveData']['linescore']['strikes'].toString();

    //     //     const runners = data['liveData']['linescore']['offense'];
    //     //     let bases = ['third', 'second', 'first'];
    //     //     let baseData = [];
    //     //     for (let base of bases) {
    //     //         if (base in runners) {
    //     //             baseData.push(['#EFB21F', '#EFB21F']);
    //     //         } else {
    //     //             baseData.push(['#888888', '#AAAAAA']);
    //     //         }
    //     //     }
    //     //     bases = `<svg class="svg" width="35" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16.25" aria-label="base"><title>Bases.</title>
    //     //         <rect fill="${baseData[0][0]}" stroke-width="1" stroke="${baseData[0][1]}" width="6" height="6" transform="translate(5, 7.25) rotate(-315)" rx="1px" ry="1px"></rect>
    //     //         <rect fill="${baseData[1][0]}" stroke-width="1" stroke="${baseData[1][1]}" width="6" height="6" transform="translate(12, 0.5) rotate(-315)" rx="1px" ry="1px"></rect>
    //     //         <rect fill="${baseData[2][0]}" stroke-width="1" stroke="${baseData[2][1]}" width="6" height="6" transform="translate(19, 7.25) rotate(-315)" rx="1px" ry="1px"></rect>
    //     //         </svg>`;

    //     //     inningData = '<span class="inning-num">' + inningData + '</span>';
    //     //     inningData = inningData + bases + '&nbsp;' + outs + '&nbsp;' + count;
    //     //     inningData = '<span class="svg-span">' + inningData + '</span>';
    //     // }

    //     // let detailedState = data['gameData']['status']['detailedState'];
    //     // if (status != 'Preview' && started) {
    //     //     if (data['liveData']['linescore']['teams']['away']['runs'] !== undefined) {
    //     //         awayScore = data['liveData']['linescore']['teams']['away']['runs'];
    //     //     }
    //     //     if (data['liveData']['linescore']['teams']['home']['runs'] !== undefined) {
    //     //         homeScore = data['liveData']['linescore']['teams']['home']['runs'];
    //     //     }
    //     // }
    //     // if (status != 'Preview' && !started) {
    //     //     status = 'Preview';
    //     // }

    //     // if (status == 'Final' && detailedState == 'Final') {
    //     //     if (homeScore > awayScore) {
    //     //         homeWin = true;
    //     //         homeScore = `<span style="font-weight: bold;">${homeScore.toString()} &#9664;</span>`;
    //     //     } else if (awayScore > homeScore) {
    //     //         homeWin = false;
    //     //         awayScore = `<span style="font-weight: bold;">${awayScore.toString()} &#9664;</span>`;
    //     //     }
    //     // } else {
    //     //     status = detailedState;
    //     // }

    //     // const currData = {
    //     //     'date': '',
    //     //     'time': '',
    //     //     'away': '',
    //     //     'awayScore': '',
    //     //     'home': '',
    //     //     'homeScore': '',
    //     //     'inning': '',
    //     //     'status': ''
    //     // };
    //     // currData['date'] = dateString;
    //     // currData['time'] = timeString;
    //     // if (awayTeam in Consts.teamsDetails) {
    //     //     currData['away'] = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[awayTeam].logo}"><span>${awayTeam}</span>`;
    //     // } else {
    //     //     currData['away'] = awayTeam;
    //     // }
    //     // currData['awayScore'] = awayScore;
    //     // if (homeTeam in Consts.teamsDetails) {
    //     //     currData['home'] = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[homeTeam].logo}"><span>${homeTeam}</span>`;
    //     // } else {
    //     //     currData['home'] = homeTeam;
    //     // }
    //     // currData['homeScore'] = homeScore;

    //     // if (status == 'Final') {
    //     //     if (homeWin) {
    //     //         currData['home'] = `<span style="font-weight: bold;">${currData['home']}</span>`
    //     //         currData['away'] = `<span style="color: #aaaaaa;">${currData['away']}</span>`
    //     //         currData['awayScore'] = `<span style="color: #aaaaaa;">${currData['awayScore']}</span>`;
    //     //     } else {
    //     //         currData['away'] = `<span style="font-weight: bold;">${currData['away']}</span>`;
    //     //         currData['home'] = `<span style="color: #aaaaaa;">${currData['home']}</span>`;
    //     //         currData['homeScore'] = `<span style="color: #aaaaaa;">${currData['homeScore']}</span>`;
    //     //     }
    //     // }

    //     // currData['inning'] = inningData;
    //     // currData['status'] = status;
    //     // status = data['gameData']['status']['abstractGameState'];

    //     // allData.push(currData);

    //     progressAmount += 1;
    //     // setProgress(100 * progressAmount / gamesForDates.length);
    // }

    // return allData;
};