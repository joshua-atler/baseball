// @ts-nocheck

import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import $ from 'jquery';
import 'datatables.net-dt';
import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-select-dt';

import { Consts } from '../../consts/consts.ts';
import '../../styles/style.css';
import '../../styles/dtStyle.css';

export default function Boxscore({ selectedGame, highlightedPlayer, setSelectedPlayer, lastTimeZone }) {
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        var timeZone = localStorage.getItem('timeZone') || 'ET';
        if (timeZone !== lastTimeZone) {
            console.log('should update times');
        }
    }, [location]);

    function findTeamIndex(teamName) {
        for (const league in Consts.teams) {
            for (let divisionIndex = 0; divisionIndex < Consts.teams[league].length; divisionIndex++) {
                const division = Consts.teams[league][divisionIndex];
                const teamIndex = division.indexOf(teamName);

                if (teamIndex !== -1) {
                    return [league, divisionIndex, teamIndex];
                }
            }
        }

        return null;
    }

    React.useEffect(() => {
        const dateSpan = $(document.querySelector('#date'));
        const recapSpan = $(document.querySelector('#recap'));

        const linescoreTable = $(document.querySelector('#linescore'));
        const pitchingTable = $(document.querySelector('#pitching'));
        const boxscoreTable = $(document.querySelector('#boxscore'));
        const subsDiv = $(document.querySelector('#subs'));
        const infoDiv = $(document.querySelector('#info'));
        const pitchersTable = $(document.querySelector('#pitchers'));
        const probablePitchersDiv = $(document.querySelector('#probable-pitchers'));
        const detailsDiv = $(document.querySelector('#details'));

        var headerRow = linescoreTable.find('thead').find('tr:nth-of-type(1)');
        var awayRow = linescoreTable.find('tbody').find('tr:nth-of-type(1)');
        var homeRow = linescoreTable.find('tbody').find('tr:nth-of-type(2)');
        var awayTeamRowCells = awayRow.find('td').slice(1, 10);
        var homeTeamRowCells = homeRow.find('td').slice(1, 10);
        var awayTeamSummaryCells = awayRow.find('td').slice(10, 13);
        var homeTeamSummaryCells = homeRow.find('td').slice(10, 13);

        var pitchingRow = $(document.querySelector('#pitching')).find('tbody').find('tr');

        var awayBoxscoreTeamLabel = $(document.querySelector('#away-tab'));
        var homeBoxscoreTeamLabel = $(document.querySelector('#home-tab'));

        var awayTab = document.querySelector('#away-tab');
        var homeTab = document.querySelector('#home-tab');

        var currInning = -1;
        var currInningHalf = '';

        var activeData = false;
        var selectedSide = 'away';


        function clearTable() {
            var boxscoreTableRows = boxscoreTable.find('tr');
            boxscoreTableRows.each(function (i, row) {
                if (i > 1) {
                    row.remove();
                }
            });

            subsDiv.empty();
            infoDiv.empty();

            var pitchersTableRows = pitchersTable.find('tr');
            pitchersTableRows.each(function (i, row) {
                if (i > 0) {
                    row.remove();
                }
            });

            detailsDiv.empty();
        }

        activeData = false;

        var numInnings;
        if (selectedGame != null) {
            var status = selectedGame['gameData']['status']['abstractGameState'];
            var detailedState = selectedGame['gameData']['status']['detailedState'];
            var linescore = selectedGame['liveData']['linescore'];

            if (status == 'Preview') {
                numInnings = 9;
            } else if (status == 'Live') {
                numInnings = linescore['innings'].length;
                if (linescore['innings'].length > 9) {
                    numInnings = linescore['innings'].length;
                } else {
                    numInnings = 9;
                }
            } else if (detailedState != 'Final') {
                numInnings = 9;
            } else {
                numInnings = linescore['innings'].length;
            }
        } else {
            numInnings = 9;
        }

        var inningsHeader = '';
        var rowTemplate = '';
        rowTemplate = '<td>-</td><td>-</td><td>-</td>';
        for (let i = 1; i <= numInnings; i++) {
            inningsHeader += `<td>${i}</td>`;
            rowTemplate += '<td>-</td>';
        }
        headerRow.html(`<th>Team</th>${inningsHeader}<th>R</th><th>H</th><th>E</th>`);
        awayRow.html(`<td>Away</td>${rowTemplate}`);
        homeRow.html(`<td>Home</td>${rowTemplate}`);

        awayTeamRowCells = awayRow.find('td').slice(1, numInnings + 1);
        homeTeamRowCells = homeRow.find('td').slice(1, numInnings + 1);
        awayTeamSummaryCells = awayRow.find('td').slice(numInnings + 1, numInnings + 4);
        homeTeamSummaryCells = homeRow.find('td').slice(numInnings + 1, numInnings + 4);

        $(headerRow.find('td')[numInnings - 1]).css('border-right', '1px solid white');
        $(homeTeamRowCells[numInnings - 1]).css('border-right', '1px solid white');
        $(awayTeamRowCells[numInnings - 1]).css('border-right', '1px solid white');

        if (numInnings > 9) {
            $(headerRow.find('td')[8]).css('border-right', 'none');
            $(homeTeamRowCells[8]).css('border-right', 'none');
            $(awayTeamRowCells[8]).css('border-right', 'none');
        }

        if (selectedGame === null) {
            pitchingTable.show();
            boxscoreTable.show();
            subsDiv.show();
            infoDiv.show();
            pitchersTable.show();

            probablePitchersDiv.empty();
            probablePitchersDiv.hide();

            dateSpan.text('');
            recapSpan.text('');

            $(awayRow.find('td')[0]).text('Away');
            $(homeRow.find('td')[0]).text('Home');

            for (let i = 0; i < numInnings; i++) {
                $(awayTeamRowCells[i]).text('-');
                $(homeTeamRowCells[i]).text('-');
            }

            for (let i = 0; i < 3; i++) {
                $(awayTeamSummaryCells[i]).text('-');
                $(homeTeamSummaryCells[i]).text('-');
            }

            currInning = -1;
            currInningHalf = '';

            for (let i = 0; i < numInnings; i++) {
                $(awayTeamRowCells[i]).removeClass('inning-highlight');
                $(homeTeamRowCells[i]).removeClass('inning-highlight');
            }

            pitchingRow.find('td').eq(0).text('-');
            pitchingRow.find('td').eq(1).text('-');
            pitchingRow.find('td').eq(2).text('-');

            awayBoxscoreTeamLabel.text('Away');
            homeBoxscoreTeamLabel.text('Home');

            clearTable();
            $(awayTab).css('background-color', '#555555');
            $(homeTab).css('background-color', '#555555');

            // var playsEvent = new CustomEvent('plays', { detail: null });
            // document.dispatchEvent(playsEvent);

            // var contentEvent = new CustomEvent('content', { detail: null });
            // document.dispatchEvent(contentEvent);
        } else {
            if (detailedState == 'Scheduled') {
                pitchingTable.hide();
                boxscoreTable.hide();
                subsDiv.hide();
                infoDiv.hide();
                pitchersTable.hide();

                probablePitchersDiv.hide();
                probablePitchersDiv.empty();

                var probablePitchers = selectedGame['gameData']['probablePitchers'];
                const isEmpty = (obj) => Object.keys(obj).length === 0;
                if (!isEmpty(probablePitchers)) {
                    // console.log('probablePitchers');
                    // console.log(probablePitchers);
                    probablePitchersDiv.append(`<p class="probable-pitchers-title probable-pitchers-label">PROBABLE PITCHERS</p>`);

                    function probablePitcherText(side) {
                        return `<img class="probable-pitcher-photo" src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${probablePitchers[side]['id']}/headshot/silo/current">
                        ${playerLink(probablePitchers[side]['id'], probablePitchers[side]['fullName'])}`;
                    }

                    var pitchersData = {};

                    ['away', 'home'].forEach(side => {
                        pitchersData[side] = {};
                        pitchersData[side]['winsLosses'] = '---';
                        pitchersData[side]['ERA'] = '---';
                        pitchersData[side]['WHIP'] = '---';
                        pitchersData[side]['IP'] = '---';
                        pitchersData[side]['K/9'] = '---';
                        pitchersData[side]['BB/9'] = '---';

                        if (side in probablePitchers) {
                            pitchersData[side]['name'] = probablePitcherText(side);

                            fetch(`https://statsapi.mlb.com/api/v1/people/${probablePitchers[side]['id']}?hydrate=stats(group=[pitching],type=[season,seasonAdvanced,career,careerAdvanced])`)
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Network response was not ok');
                                    }
                                    return response.json();
                                })
                                .then(data => {
                                    data = data['people'][0];
                                    var pitchHand = data['pitchHand']['code'];
                                    pitchersData[side]['name'] = `${pitchersData[side]['name']} (${pitchHand})`;

                                    var seasonStats = data['stats'][0]['splits'][0]['stat'];

                                    pitchersData[side]['winsLosses'] = `${seasonStats['wins']}-${seasonStats['losses']}`;
                                    pitchersData[side]['ERA'] = `${seasonStats['era']}`;
                                    pitchersData[side]['WHIP'] = `${seasonStats['whip']}`;
                                    pitchersData[side]['IP'] = `${seasonStats['inningsPitched']}`;
                                    pitchersData[side]['K/9'] = `${seasonStats['strikeoutsPer9Inn']}`;
                                    pitchersData[side]['BB/9'] = `${seasonStats['walksPer9Inn']}`;

                                })
                        } else {
                            pitchersData[side]['name'] = 'TBD';
                        }
                    });

                    setTimeout(() => {
                        probablePitchersDiv.append(`<table>
                            <tr><td colSpan="3">${pitchersData['away']['name']}</td><td colSpan="3">${pitchersData['home']['name']}</td></tr>
                            <tr>
                                <td>W-L: ${pitchersData['away']['winsLosses']}</td><td>ERA: ${pitchersData['away']['ERA']}</td><td>WHIP: ${pitchersData['away']['WHIP']}</td>
                                <td>W-L: ${pitchersData['home']['winsLosses']}</td><td>ERA: ${pitchersData['home']['ERA']}</td><td>WHIP: ${pitchersData['home']['WHIP']}</td>
                            </tr>
                            <tr>
                                <td>IP: ${pitchersData['away']['IP']}</td><td>K/9: ${pitchersData['away']['K/9']}</td><td>BB/9: ${pitchersData['away']['BB/9']}</td>
                                <td>IP: ${pitchersData['home']['IP']}</td><td>K/9: ${pitchersData['home']['K/9']}</td><td>BB/9: ${pitchersData['home']['BB/9']}</td>
                            </tr>
                        </table>`);
                        
                        setTimeout(() => {
                            probablePitchersDiv.show();
                        }, 100);
                    }, 200);
                }

            } else {
                pitchingTable.show();
                boxscoreTable.show();
                subsDiv.show();
                infoDiv.show();
                pitchersTable.show();
                probablePitchersDiv.hide();
            }

            activeData = true;
            if (selectedSide == 'away') {
                $(awayTab).css('background-color', '#0416c0');
                $(homeTab).css('background-color', '#555555');
            } else {
                $(awayTab).css('background-color', '#555555');
                $(homeTab).css('background-color', '#0416c0');
            }

            var timeZone = localStorage.getItem('timeZone') || 'ET';
            var date = new Date(selectedGame['gameData']['datetime']['dateTime']).toLocaleDateString('en-US');
            var time = new Date(selectedGame['gameData']['datetime']['dateTime']);
            time.setHours(time.getHours() + Consts.timeZoneOffset[timeZone]);
            time = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

            dateSpan.text(`${date} ${time}`);

            recapSpan.html(`<a href="https://www.mlb.com/stories/game/${selectedGame['gameData']['game']['pk']}" target="_blank">Video recap</a>`);

            var awayTeamRuns = Array(numInnings).fill('-');
            var homeTeamRuns = Array(numInnings).fill('-');

            for (let i = 0; i < numInnings; i++) {
                try {
                    awayTeamRuns[i] = linescore['innings'][i]['away']['runs'];
                    homeTeamRuns[i] = linescore['innings'][i]['home']['runs'];
                    $(awayTeamRowCells[i]).text(awayTeamRuns[i]);
                    $(homeTeamRowCells[i]).text(homeTeamRuns[i]);
                } catch (error) {

                }
            };

            try {
                var awayTeamTotalRuns = linescore['teams']['away']['runs'];
                var awayTeamTotalHits = linescore['teams']['away']['hits'];
                var awayTeamTotalErrors = linescore['teams']['away']['errors'];
                var homeTeamTotalRuns = linescore['teams']['home']['runs'];
                var homeTeamTotalHits = linescore['teams']['home']['hits'];
                var homeTeamTotalErrors = linescore['teams']['home']['errors'];

                $(awayTeamSummaryCells[0]).text(awayTeamTotalRuns);
                $(awayTeamSummaryCells[1]).text(awayTeamTotalHits);
                $(awayTeamSummaryCells[2]).text(awayTeamTotalErrors);
                $(homeTeamSummaryCells[0]).text(homeTeamTotalRuns);
                $(homeTeamSummaryCells[1]).text(homeTeamTotalHits);
                $(homeTeamSummaryCells[2]).text(homeTeamTotalErrors);
            } catch {

            }

            var awayTeam = selectedGame['gameData']['teams']['away'];
            var homeTeam = selectedGame['gameData']['teams']['home'];

            var awayTeamName = awayTeam['name'];
            var homeTeamName = homeTeam['name'];

            var awayTeamClubName = awayTeam['clubName'];
            var homeTeamClubName = homeTeam['clubName'];

            var awayTeamAbbr = awayTeam['abbreviation'];
            var homeTeamAbbr = homeTeam['abbreviation'];

            $(awayRow.find('td')[0]).text(awayTeamAbbr);
            $(homeRow.find('td')[0]).text(homeTeamAbbr);

            if (awayTeamName in Consts.teamsDetails) {
                $(awayRow.find('td')[0]).html(`<img width="30" height="30" class="logo" src="${Consts.teamsDetails[awayTeamName].logo}"><span>${awayTeamAbbr}</span>`);
            }

            if (homeTeamName in Consts.teamsDetails) {
                $(homeRow.find('td')[0]).html(`<img width="30" height="30" class="logo" src="${Consts.teamsDetails[homeTeamName].logo}"><span>${homeTeamAbbr}</span>`);
            }

            if (status == 'Live') {
                var status = selectedGame['gameData']['status']['abstractGameState'];
                var linescore = selectedGame['liveData']['linescore'];

                currInning = linescore['currentInning'];
                currInningHalf = linescore['inningHalf'];

                for (let i = 0; i < numInnings; i++) {
                    $(awayTeamRowCells[i]).removeClass('inning-highlight');
                    $(homeTeamRowCells[i]).removeClass('inning-highlight');
                }

                if (currInningHalf == 'Top') {
                    $(awayTeamRowCells[currInning - 1]).addClass('inning-highlight');
                } else if (currInningHalf == 'Bottom') {
                    $(homeTeamRowCells[currInning - 1]).addClass('inning-highlight');
                }
            }

            try {
                var winner = selectedGame['liveData']['decisions']['winner'];
                var loser = selectedGame['liveData']['decisions']['loser'];
                var save = 'N/A';
                if ('save' in selectedGame['liveData']['decisions']) {
                    var save = selectedGame['liveData']['decisions']['save'];
                }
                pitchingRow.find('td').eq(0).html(playerLink(winner['id'], winner['fullName']));
                pitchingRow.find('td').eq(1).html(playerLink(loser['id'], loser['fullName']));
                if (save != 'N/A') {
                    pitchingRow.find('td').eq(2).html(playerLink(save['id'], save['fullName']));
                } else {
                    pitchingRow.find('td').eq(2).html('-');
                }
            } catch {
                pitchingRow.find('td').eq(0).text('-');
                pitchingRow.find('td').eq(1).text('-');
                pitchingRow.find('td').eq(2).text('-');
            }

            var awayTeamID = awayTeam['id'];
            var homeTeamID = homeTeam['id'];
            var awayTeamRecord = '';
            var homeTeamRecord = '';

            var gameDate = new Date(selectedGame['gameData']['datetime']['dateTime']);
            var gameDateMM = (gameDate.getMonth() + 1).toString().padStart(2, '0');
            var gameDateDD = gameDate.getDate().toString().padStart(2, '0');
            var gameDateYYYY = gameDate.getFullYear().toString();
            var standingsURL = `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${gameDateYYYY}&standingsTypes=regularSeason&date=${gameDateMM}/${gameDateDD}/${gameDateYYYY}`;
            (async () => {
                const standingsResponse = await fetch(standingsURL);
                const standingsJson = await standingsResponse.json();
                for (let i = 0; i < standingsJson['records'].length; i++) {
                    var divisionRecord = standingsJson['records'][i]['teamRecords'];
                    for (let j = 0; j < divisionRecord.length; j++) {
                        if (divisionRecord[j]['team']['id'] == awayTeamID) {
                            awayTeamRecord = `(${divisionRecord[j]['wins']}-${divisionRecord[j]['losses']})`;
                        }

                        if (divisionRecord[j]['team']['id'] == homeTeamID) {
                            homeTeamRecord = `(${divisionRecord[j]['wins']}-${divisionRecord[j]['losses']})`;
                        }
                    }
                }

                if (awayTeamName in Consts.teamsDetails) {
                    awayBoxscoreTeamLabel.html(`<img width="30" height="30" class="logo" src="${Consts.teamsDetails[awayTeamName].logo}"><span>${awayTeamClubName} ${awayTeamRecord}</span>`);
                } else {
                    awayBoxscoreTeamLabel.text(awayTeamName);
                }

                if (homeTeamName in Consts.teamsDetails) {
                    homeBoxscoreTeamLabel.html(`<img width="30" height="30" class="logo" src="${Consts.teamsDetails[homeTeamName].logo}"><span>${homeTeamClubName} ${homeTeamRecord}</span>`);
                } else {
                    homeBoxscoreTeamLabel.text(homeTeamName);
                }
            })();

            boxscore(selectedGame, selectedSide);

            var playsEvent = new CustomEvent('plays', { detail: selectedGame });
            document.dispatchEvent(playsEvent);

            var contentEvent = new CustomEvent('content', { detail: selectedGame['gameData']['game']['pk'] });
            document.dispatchEvent(contentEvent);
        }

        awayTab.onclick = function () {
            if (activeData) {
                selectedSide = 'away';
                boxscore(selectedGame, selectedSide);
                $(awayTab).css('background-color', '#0416c0');
                $(homeTab).css('background-color', '#555555');
            }
        };

        homeTab.onclick = function () {
            if (activeData) {
                selectedSide = 'home';
                boxscore(selectedGame, selectedSide);
                $(awayTab).css('background-color', '#555555');
                $(homeTab).css('background-color', '#0416c0');
            }
        };

        function playerLink(ID, name) {
            var link = `<a href="/players" class="player-link" data-id="${ID}">${name}</a>`;
            return link;
        }

        function boxscoreRow(player, isCurrentBatter) {
            var batting = player['stats']['batting'];
            var seasonBatting = player['seasonStats']['batting'];

            var battingOrder = player['battingOrder'];
            battingOrder = battingOrder % 100 ? '&nbsp;&#x2937;&nbsp;' : '';

            var note = 'note' in batting ? batting['note'] : '';
            var playerID = player['person']['id'];
            var jerseyNum = '';
            if ('jerseyNumber' in player && player['jerseyNumber'].length > 0) {
                jerseyNum = '#' + player['jerseyNumber'];
            }
            var name = player['person']['fullName'];

            var allPositions = player['allPositions'];
            var pos = '';
            for (let i = 0; i < allPositions.length; i++) {
                pos += allPositions[i]['abbreviation'];
                if (i != allPositions.length - 1) {
                    pos += '-';
                }
            }

            var atBats = batting['atBats'];
            var runs = batting['runs'];
            var hits = batting['hits'];
            var walks = batting['baseOnBalls'];
            var rbi = batting['rbi'];
            var homeRuns = batting['homeRuns'];
            var strikeOuts = batting['strikeOuts'];

            var avg = seasonBatting['avg'];
            var ops = seasonBatting['ops'];

            var currentBatterStyle = isCurrentBatter ? 'class="current-player"' : '';

            var boxscoreString = `<tr ${currentBatterStyle}><td>${battingOrder}${note}${playerLink(playerID, name)}</td><td>${jerseyNum}</td><td>${pos}</td><td>${atBats}</td><td>${runs}</td><td>${hits}</td><td>${walks}</td><td>${rbi}</td><td>${homeRuns}</td><td>${strikeOuts}</td><td>${avg}</td><td>${ops}</td></tr>`;

            return boxscoreString;
        }

        function pitcherRow(player) {
            var pitching = player['stats']['pitching'];
            var seasonPitching = player['seasonStats']['pitching'];

            var note = 'note' in pitching ? `&nbsp;${pitching['note']}` : '';
            var playerID = player['person']['id'];
            var jerseyNum = '';
            if ('jerseyNumber' in player && player['jerseyNumber'].length > 0) {
                jerseyNum = '#' + player['jerseyNumber'];
            }
            var name = player['person']['fullName'];

            var inningsPitched = pitching['inningsPitched'];
            var hits = pitching['hits'];
            var runs = pitching['runs'];
            var earnedRuns = pitching['earnedRuns'];
            var walks = pitching['baseOnBalls'];
            var strikeOuts = pitching['strikeOuts'];
            var homeRuns = pitching['homeRuns'];

            var era = seasonPitching['era'];

            var pitchingString = `<tr><td>${playerLink(playerID, name)}${note}</td><td>${jerseyNum}</td><td>${inningsPitched}</td><td>${hits}</td><td>${runs}</td><td>${earnedRuns}</td><td>${walks}</td><td>${strikeOuts}</td><td>${homeRuns}</td><td>${era}</td></tr>`;

            return pitchingString;
        }

        function boxscore(selectedGame, teamSide) {
            clearTable();
            var players = selectedGame['liveData']['boxscore']['teams'][teamSide]['players'];
            var batters = selectedGame['liveData']['boxscore']['teams'][teamSide]['batters'];
            var currentBatter;
            try {
                currentBatter = selectedGame['liveData']['plays']['currentPlay']['matchup']['batter'];
            } catch {
                currentBatter = { 'id': null };
            }
            for (let i = 0; i < batters.length; i++) {
                var playerID = 'ID' + batters[i].toString();
                if (players[playerID]['position']['type'] != 'Pitcher') {
                    boxscoreTable.append(boxscoreRow(players[playerID], (selectedGame['gameData']['status']['abstractGameState'] == 'Live') ? batters[i].toString() == currentBatter['id'] : false));
                }
            }

            var boxscoreTableData = tableToArray(boxscoreTable);
            if (boxscoreTableData != null) {
                var boxscoreTotalsRow = `<tr class='totals-row'><td>Totals</td><td></td><td></td>`;
                for (let i = 3; i <= 9; i++) {
                    var sum = boxscoreTableData[i].reduce((sum, value) => sum + parseInt(value, 10), 0);
                    boxscoreTotalsRow += `<td>${sum}</td>`;
                }
                boxscoreTotalsRow += '<td></td><td></td></tr>';
                boxscoreTable.append(boxscoreTotalsRow);
            }

            var subs = selectedGame['liveData']['boxscore']['teams'][teamSide]['note'];
            for (let i = 0; i < subs.length; i++) {
                subsDiv.append(`<p>${subs[i]['label']}-${subs[i]['value']}</p>`);
            }

            var info = selectedGame['liveData']['boxscore']['teams'][teamSide]['info'];
            for (let i = 0; i < info.length; i++) {
                infoDiv.append('<div class="info-group">');
                infoDiv.append(`<p class="info-title info-label">${info[i]['title']}</p>`);
                for (let j = 0; j < info[i]['fieldList'].length; j++) {
                    var infoItem = info[i]['fieldList'][j];
                    infoDiv.append(`<p><span class="info-label">${infoItem['label']}:</span> ${infoItem['value']}</p>`);
                }
                infoDiv.append('</div>');
            }

            var pitchers = selectedGame['liveData']['boxscore']['teams'][teamSide]['pitchers'];
            for (let i = 0; i < pitchers.length; i++) {
                var playerID = 'ID' + pitchers[i].toString();
                if (!$.isEmptyObject(players[playerID]['stats']['pitching'])) {
                    pitchersTable.append(pitcherRow(players[playerID]));
                }
            }

            var pitchersTableData = tableToArray(pitchersTable);
            if (pitchersTableData != null) {
                var pitchersTableRow = `<tr class='totals-row'><td>Totals</td><td></td>`;
                for (let i = 2; i <= 8; i++) {
                    var sum = 0;
                    if (i == 2) {
                        sum = pitchersTableData[i].reduce((sum, value) => sum + parseFloat(value, 10), 0);
                        var decimal = sum % 1;
                        if (decimal > 0.25) {
                            var extra = decimal / 3 * 10;
                            sum = sum - decimal + extra;
                        }
                        sum = sum.toFixed(1);
                    } else {
                        sum = pitchersTableData[i].reduce((sum, value) => sum + parseInt(value, 10), 0);
                    }
                    pitchersTableRow += `<td>${sum}</td>`;
                }
                pitchersTableRow += '<td></td></tr>';
                pitchersTable.append(pitchersTableRow);
            }

            var details = selectedGame['liveData']['boxscore']['info'];
            detailsDiv.append(`<p class="details-title details-label">GAME NOTES</p>`);
            for (let i = 0; i < details.length; i++) {
                if ('value' in details[i]) {
                    detailsDiv.append(`<p><span class="details-label">${details[i]['label']}:</span> ${details[i]['value']}</p>`);
                } else {
                    detailsDiv.append(`<p><span class="details-label">${details[i]['label']}</span></p>`);
                }
            }
        }

        function tableToArray(table) {
            var tableArray = [];
            table.find('tbody tr').each(function () {
                var rowArray = [];
                $(this).find('td').each(function () {
                    rowArray.push($(this).text());
                });
                tableArray.push(rowArray);
            });
            if (tableArray.length == 0) {
                return null;
            } else {
                var transposed = tableArray[0].map((_, colIndex) => tableArray.map(row => row[colIndex]));
                return transposed;
            }
        }

        $(document).off('click', '.player-link').on('click', '.player-link', function (e) {
            e.preventDefault();
            var ID = $(this).data('id');

            fetch(`https://statsapi.mlb.com/api/v1/people/${ID}?hydrate=currentTeam`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    var currentTeam = data['people'][0]['currentTeam']['name'];
                    console.log(currentTeam);
                    var teamIndex = findTeamIndex(currentTeam);
                    setSelectedPlayer({ playerID: ID, color: [Consts.teamColors[teamIndex[0]][teamIndex[1]][teamIndex[2]], Consts.teamSecondColors[teamIndex[0]][teamIndex[1]][teamIndex[2]]] });
                    navigate('/players');
                })
        });
    }, [selectedGame]);

    React.useEffect(() => {
        try {
            const boxscoreTable = $(document.querySelector('#boxscore'));

            boxscoreTable.find('tr td a').each(function () {
                if ($(this).text() == highlightedPlayer) {
                    $(this).closest('tr').addClass('selected-batter');
                } else {
                    $(this).closest('tr').removeClass('selected-batter');
                }
            });
        } catch {

        }
    }, [highlightedPlayer]);


    return (
        <>
            <p className="details">Date: <span id="date"></span></p>
            <p className="details">Recap: <span id="recap"></span></p>
            <table id="linescore">
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>1</th>
                        <th>2</th>
                        <th>3</th>
                        <th>4</th>
                        <th>5</th>
                        <th>6</th>
                        <th>7</th>
                        <th>8</th>
                        <th>9</th>
                        <th>R</th>
                        <th>H</th>
                        <th>E</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Away</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Home</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
            <table id="pitching">
                <thead>
                    <tr>
                        <th>Win</th>
                        <th>Loss</th>
                        <th>Save</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                </tbody>
            </table>
            <table id="boxscore">
                <colgroup>
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                </colgroup>
                <thead>
                    <tr>
                        <th colSpan={12}>
                            <span id="away-tab">Away</span>
                            <span id="home-tab">Home</span>
                        </th>
                    </tr>
                    <tr>
                        <th colSpan={3}>Batter</th>
                        <th><span className="tooltip" data-tooltip="At bats">AB</span></th>
                        <th><span className="tooltip" data-tooltip="Runs">R</span></th>
                        <th><span className="tooltip" data-tooltip="Hits">H</span></th>
                        <th><span className="tooltip" data-tooltip="Walks">BB</span></th>
                        <th><span className="tooltip" data-tooltip="Runs batted in">RBI</span></th>
                        <th><span className="tooltip" data-tooltip="Home runs">HR</span></th>
                        <th><span className="tooltip" data-tooltip="Strikeouts">K</span></th>
                        <th><span className="tooltip" data-tooltip="Batting average">AVG</span></th>
                        <th><span className="tooltip" data-tooltip="On-base plus slugging">OPS</span></th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
            <div id="subs"></div>
            <div id="info"></div>
            <table id="pitchers">
                <colgroup>
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                    <col />
                </colgroup>
                <thead>
                    <tr>
                        <th colSpan={2}>Pitcher</th>
                        <th><span className="tooltip" data-tooltip="Innings pitched">IP</span></th>
                        <th><span className="tooltip" data-tooltip="Hits">H</span></th>
                        <th><span className="tooltip" data-tooltip="Runs">R</span></th>
                        <th><span className="tooltip" data-tooltip="Earned runs">ER</span></th>
                        <th><span className="tooltip" data-tooltip="Walks">BB</span></th>
                        <th><span className="tooltip" data-tooltip="Strikeouts">K</span></th>
                        <th><span className="tooltip" data-tooltip="Home runs">HR</span></th>
                        <th><span className="tooltip" data-tooltip="Earned run average">ERA</span></th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
            <div id="probable-pitchers"></div>
            <div id="details"></div>
        </>
    )
}