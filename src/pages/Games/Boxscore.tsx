// @ts-nocheck

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiExternalLink } from 'react-icons/hi';

import { ToggleButtonGroup, ToggleButton, Box, Stack, Typography, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';


import { Consts } from '../../consts/consts.ts';
import '../../styles/style.css';
import { useBasedash } from '../../context/BasedashContext.tsx';
import { fetchGame } from '../../services/gamesService.ts';
import { fetchPlayer } from '../../services/playerService.ts';
import { lightBlue } from '@mui/material/colors';


function LinescoreRow({ currGame, team }) {

    const currentInning = currGame?.liveData?.linescore?.currentInning;
    const currentTeam = currGame?.liveData?.linescore?.isTopInning ? 'away' : 'home';

    return <tr>
        <td>{currGame && <img width="30" height="30" className="logo" src={`/teamLogos/${currGame?.gameData?.teams?.[team]?.abbreviation}.svg`} />}{currGame?.gameData?.teams?.[team]?.abbreviation ?? 'Away'}</td>

        {currGame?.liveData?.linescore?.innings?.map((inning, i) => {
            const highlight = currentInning === inning.num && currentTeam === team;
            return <td key={i} style={{
                backgroundColor: highlight ? '#374bfb' : undefined,
                borderRadius: highlight ? '50%' : undefined
            }} >{inning?.[team].runs ?? '-'}</td>
        })}
        {Array.from({ length: Math.max(0, 9 - (currGame?.liveData?.linescore?.innings?.length || 0)) }).map((_, i) => (
            <td key={`empty-${i}`}>-</td>
        ))}

        {currGame &&
            <>
                <td>{currGame?.liveData?.linescore?.teams?.[team]?.runs ?? '-'}</td>
                <td>{currGame?.liveData?.linescore?.teams?.[team]?.hits ?? '-'}</td>
                <td>{currGame?.liveData?.linescore?.teams?.[team]?.errors ?? '-'}</td>
            </>
        }
        {!currGame && Array.from({ length: 3 }).map((_, i) => {
            return <td key={i}>-</td>
        })}
    </tr>
}

function ProbablePitcher({ pitcher }) {

    const pitcherStats = pitcher?.people?.[0]?.stats;
    const seasonStats = pitcherStats.find(x => x.type.displayName === 'season')?.splits?.[0]?.stat;

    const stats = [
        { label: 'W-L', description: 'Wins-Losses', value: `${seasonStats?.wins}-${seasonStats?.losses}` },
        { label: 'ERA', description: 'Earned run average', value: seasonStats.era ?? '---' },
        { label: 'WHIP', description: 'Walks plus hits per inning pitched', value: seasonStats.whip ?? '---' },
        { label: 'IP', description: 'Innings pitched', value: seasonStats.inningsPitched ?? '---' },
        { label: 'K/9', description: 'Strikeouts per 9 innings', value: seasonStats.strikeoutsPer9Inn ?? '---' },
        { label: 'BB/9', description: 'Walks per 9 innings', value: seasonStats.walksPer9Inn ?? '---' },
    ];

    return <Stack spacing={2}>
        <Box
            component="img"
            src={`https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${pitcher?.people?.[0]?.id}/headshot/silo/current`}
            sx={{
                width: 150,
                height: 150,
                objectFit: 'cover'
            }}
        />
        <Typography>
            <Link to={`/players/${pitcher?.people?.[0]?.id}`}>{pitcher?.people?.[0]?.fullName}</Link>
            {` (${pitcher?.people?.[0]?.pitchHand?.code})`}
        </Typography>
        <Grid container spacing={2}
        >
            {stats.map((stat, i) => (
                <Grid key={i} size={4}>
                    <Typography>
                        <span className="tooltip" data-tooltip={stat.description}>{stat.label}</span>{`: ${stat.value}`}
                    </Typography>
                </Grid>
            ))}
        </Grid>
    </Stack>
}

export default function Boxscore({ selectedGame, highlightedPlayer, setSelectedPlayer }) {
    const navigate = useNavigate();
    const { timeZone } = useBasedash();

    const [currGame, setCurrGame] = useState(null);
    const [probablePitchers, setProbablePitchers] = useState(null);
    // const [teamRecords, setTeamRecords] = useState(null);
    const [selectedSide, setSelectedSide] = useState('away');
    const displayValue = currGame ? selectedSide : null;

    async function fillBoxscore(selectedGame) {
        setCurrGame(await fetchGame(selectedGame));
        // setTeamRecords(await fetchRecords());
    }

    async function fetchProbablePitchers(currGame) {
        const awayPitcherID = currGame?.gameData?.probablePitchers?.away?.id ?? null;
        const homePitcherID = currGame?.gameData?.probablePitchers?.home?.id ?? null;
        setProbablePitchers(await Promise.all([
            awayPitcherID === null ? null : fetchPlayer(awayPitcherID, ['pitching'], ['season']),
            homePitcherID === null ? null : fetchPlayer(homePitcherID, ['pitching'], ['season'])
        ]));
    }

    const [awayPitcher, homePitcher] = probablePitchers ?? [null, null];

    const awayTeamName = currGame?.gameData?.teams?.away?.teamName.toLowerCase().replace(' ', '-');
    const homeTeamName = currGame?.gameData?.teams?.home?.teamName.toLowerCase().replace(' ', '-');
    const gameDate = currGame?.gameData?.datetime?.officialDate;
    const [year, month, day] = gameDate?.split('-') || [];

    const gamedayUrl = `https://www.mlb.com/gameday/${awayTeamName}-vs-${homeTeamName}/${year}/${month}/${day}/${selectedGame}/final/box`;

    const abstractGameState = currGame?.gameData?.status?.abstractGameState;
    const detailedState = currGame?.gameData?.status?.detailedState;
    const linescore = currGame?.liveData?.linescore;

    let numInnings = 9;
    if (currGame) {

        if (abstractGameState === 'Preview') {
            numInnings = 9;
        } else if (abstractGameState === 'Live') {
            numInnings = linescore.innings.length;
            if (linescore.innings.length > 9) {
                numInnings = linescore.innings.length;
            } else {
                numInnings = 9;
            }
        } else if (detailedState !== 'Final') {
            numInnings = 9;
        } else {
            numInnings = linescore.innings.length;
        }
    } else {
        numInnings = 9;
    }

    const teamStats = {};
    teamStats.away = currGame?.liveData?.boxscore?.teams?.away?.teamStats;
    teamStats.home = currGame?.liveData?.boxscore?.teams?.home?.teamStats;



    useEffect(() => {
        if (currGame) {
            (async () => {
                fetchProbablePitchers(currGame);
            })();
        } else {
            setProbablePitchers(null);
        }
    }, [currGame]);

    useEffect(() => {
        if (selectedGame) {
            (async () => {
                fillBoxscore(selectedGame);
            })();
        } else {
            setCurrGame(null);
        }

        // var numInnings;
        // if (selectedGame != null) {
        //     var status = selectedGame['gameData']['status']['abstractGameState'];
        //     var detailedState = selectedGame['gameData']['status']['detailedState'];
        //     var linescore = selectedGame['liveData']['linescore'];

        //     if (status == 'Preview') {
        //         numInnings = 9;
        //     } else if (status == 'Live') {
        //         numInnings = linescore['innings'].length;
        //         if (linescore['innings'].length > 9) {
        //             numInnings = linescore['innings'].length;
        //         } else {
        //             numInnings = 9;
        //         }
        //     } else if (detailedState != 'Final') {
        //         numInnings = 9;
        //     } else {
        //         numInnings = linescore['innings'].length;
        //     }
        // } else {
        //     numInnings = 9;
        // }

        // var inningsHeader = '';
        // var rowTemplate = '';
        // rowTemplate = '<td>-</td><td>-</td><td>-</td>';
        // for (let i = 1; i <= numInnings; i++) {
        //     inningsHeader += `<td>${i}</td>`;
        //     rowTemplate += '<td>-</td>';
        // }
        // headerRow.html(`<th>Team</th>${inningsHeader}<th>R</th><th>H</th><th>E</th>`);
        // awayRow.html(`<td>Away</td>${rowTemplate}`);
        // homeRow.html(`<td>Home</td>${rowTemplate}`);

        // awayTeamRowCells = awayRow.find('td').slice(1, numInnings + 1);
        // homeTeamRowCells = homeRow.find('td').slice(1, numInnings + 1);
        // awayTeamSummaryCells = awayRow.find('td').slice(numInnings + 1, numInnings + 4);
        // homeTeamSummaryCells = homeRow.find('td').slice(numInnings + 1, numInnings + 4);

        // if (selectedGame === null) {
        //     pitchingTable.show();
        //     boxscoreTable.show();
        //     pitchersTable.show();


        //     $(awayRow.find('td')[0]).text('Away');
        //     $(homeRow.find('td')[0]).text('Home');

        //     for (let i = 0; i < numInnings; i++) {
        //         $(awayTeamRowCells[i]).text('-');
        //         $(homeTeamRowCells[i]).text('-');
        //     }

        //     for (let i = 0; i < 3; i++) {
        //         $(awayTeamSummaryCells[i]).text('-');
        //         $(homeTeamSummaryCells[i]).text('-');
        //     }

        //     currInning = -1;
        //     currInningHalf = '';

        //     for (let i = 0; i < numInnings; i++) {
        //         $(awayTeamRowCells[i]).removeClass('inning-highlight');
        //         $(homeTeamRowCells[i]).removeClass('inning-highlight');
        //     }

        //     // var playsEvent = new CustomEvent('plays', { detail: null });
        //     // document.dispatchEvent(playsEvent);

        //     // var contentEvent = new CustomEvent('content', { detail: null });
        //     // document.dispatchEvent(contentEvent);
        // } else {
        //     if (detailedState == 'Scheduled') {
        //         pitchingTable.hide();
        //         boxscoreTable.hide();
        //         pitchersTable.hide();

        //     var date = new Date(selectedGame['gameData']['datetime']['dateTime']).toLocaleDateString('en-US');
        //     var time = new Date(selectedGame['gameData']['datetime']['dateTime']);
        //     time.setHours(time.getHours() + Consts.timeZoneOffset[timeZone]);
        //     time = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

        //     dateSpan.text(`${date} ${time}`);

        //     recapSpan.html(`<a href="https://www.mlb.com/stories/game/${selectedGame['gameData']['game']['pk']}" target="_blank">Video recap</a>`);

        //     var awayTeamRuns = Array(numInnings).fill('-');
        //     var homeTeamRuns = Array(numInnings).fill('-');

        //     for (let i = 0; i < numInnings; i++) {
        //         try {
        //             awayTeamRuns[i] = linescore['innings'][i]['away']['runs'];
        //             homeTeamRuns[i] = linescore['innings'][i]['home']['runs'];
        //             $(awayTeamRowCells[i]).text(awayTeamRuns[i]);
        //             $(homeTeamRowCells[i]).text(homeTeamRuns[i]);
        //         } catch (error) {

        //         }
        //     };

        //     try {
        //         var awayTeamTotalRuns = linescore['teams']['away']['runs'];
        //         var awayTeamTotalHits = linescore['teams']['away']['hits'];
        //         var awayTeamTotalErrors = linescore['teams']['away']['errors'];
        //         var homeTeamTotalRuns = linescore['teams']['home']['runs'];
        //         var homeTeamTotalHits = linescore['teams']['home']['hits'];
        //         var homeTeamTotalErrors = linescore['teams']['home']['errors'];

        //         $(awayTeamSummaryCells[0]).text(awayTeamTotalRuns);
        //         $(awayTeamSummaryCells[1]).text(awayTeamTotalHits);
        //         $(awayTeamSummaryCells[2]).text(awayTeamTotalErrors);
        //         $(homeTeamSummaryCells[0]).text(homeTeamTotalRuns);
        //         $(homeTeamSummaryCells[1]).text(homeTeamTotalHits);
        //         $(homeTeamSummaryCells[2]).text(homeTeamTotalErrors);
        //     } catch {

        //     }

        //     var awayTeam = selectedGame['gameData']['teams']['away'];
        //     var homeTeam = selectedGame['gameData']['teams']['home'];

        //     var awayTeamName = awayTeam['name'];
        //     var homeTeamName = homeTeam['name'];

        //     var awayTeamClubName = awayTeam['clubName'];
        //     var homeTeamClubName = homeTeam['clubName'];

        //     var awayTeamAbbr = awayTeam['abbreviation'];
        //     var homeTeamAbbr = homeTeam['abbreviation'];

        //     $(awayRow.find('td')[0]).text(awayTeamAbbr);
        //     $(homeRow.find('td')[0]).text(homeTeamAbbr);

        //     if (awayTeamName in Consts.teamsDetails) {
        //         $(awayRow.find('td')[0]).html(`<img width="30" height="30" class="logo" src="${Consts.teamsDetails[awayTeamName].logo}"><span>${awayTeamAbbr}</span>`);
        //     }

        //     if (homeTeamName in Consts.teamsDetails) {
        //         $(homeRow.find('td')[0]).html(`<img width="30" height="30" class="logo" src="${Consts.teamsDetails[homeTeamName].logo}"><span>${homeTeamAbbr}</span>`);
        //     }

        //     if (status == 'Live') {
        //         var status = selectedGame['gameData']['status']['abstractGameState'];
        //         var linescore = selectedGame['liveData']['linescore'];

        //         currInning = linescore['currentInning'];
        //         currInningHalf = linescore['inningHalf'];

        //         for (let i = 0; i < numInnings; i++) {
        //             $(awayTeamRowCells[i]).removeClass('inning-highlight');
        //             $(homeTeamRowCells[i]).removeClass('inning-highlight');
        //         }

        //         if (currInningHalf == 'Top') {
        //             $(awayTeamRowCells[currInning - 1]).addClass('inning-highlight');
        //         } else if (currInningHalf == 'Bottom') {
        //             $(homeTeamRowCells[currInning - 1]).addClass('inning-highlight');
        //         }
        //     }

        //     try {
        //         var winner = selectedGame['liveData']['decisions']['winner'];
        //         var loser = selectedGame['liveData']['decisions']['loser'];
        //         var save = 'N/A';
        //         if ('save' in selectedGame['liveData']['decisions']) {
        //             var save = selectedGame['liveData']['decisions']['save'];
        //         }

        //     var awayTeamID = awayTeam['id'];
        //     var homeTeamID = homeTeam['id'];
        //     var awayTeamRecord = '';
        //     var homeTeamRecord = '';

        //     var gameDate = new Date(selectedGame['gameData']['datetime']['dateTime']);
        //     var gameDateMM = (gameDate.getMonth() + 1).toString().padStart(2, '0');
        //     var gameDateDD = gameDate.getDate().toString().padStart(2, '0');
        //     var gameDateYYYY = gameDate.getFullYear().toString();
        //     var standingsURL = `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${gameDateYYYY}&standingsTypes=regularSeason&date=${gameDateMM}/${gameDateDD}/${gameDateYYYY}`;
        //     (async () => {
        //         const standingsResponse = await fetch(standingsURL);
        //         const standingsJson = await standingsResponse.json();
        //         for (let i = 0; i < standingsJson['records'].length; i++) {
        //             var divisionRecord = standingsJson['records'][i]['teamRecords'];
        //             for (let j = 0; j < divisionRecord.length; j++) {
        //                 if (divisionRecord[j]['team']['id'] == awayTeamID) {
        //                     awayTeamRecord = `(${divisionRecord[j]['wins']}-${divisionRecord[j]['losses']})`;
        //                 }

        //                 if (divisionRecord[j]['team']['id'] == homeTeamID) {
        //                     homeTeamRecord = `(${divisionRecord[j]['wins']}-${divisionRecord[j]['losses']})`;
        //                 }
        //             }
        //         }

        //     boxscore(selectedGame, selectedSide);

        //     var playsEvent = new CustomEvent('plays', { detail: selectedGame });
        //     document.dispatchEvent(playsEvent);

        //     var contentEvent = new CustomEvent('content', { detail: selectedGame['gameData']['game']['pk'] });
        //     document.dispatchEvent(contentEvent);
        // }

        // function boxscoreRow(player, isCurrentBatter) {
        //     var batting = player['stats']['batting'];
        //     var seasonBatting = player['seasonStats']['batting'];

        //     var battingOrder = player['battingOrder'];
        //     battingOrder = battingOrder % 100 ? '&nbsp;&#x2937;&nbsp;' : '';

        //     var note = 'note' in batting ? batting['note'] : '';
        //     var playerID = player['person']['id'];
        //     var jerseyNum = '';
        //     if ('jerseyNumber' in player && player['jerseyNumber'].length > 0) {
        //         jerseyNum = '#' + player['jerseyNumber'];
        //     }
        //     var name = player['person']['fullName'];

        //     var allPositions = player['allPositions'];
        //     var pos = '';
        //     for (let i = 0; i < allPositions.length; i++) {
        //         pos += allPositions[i]['abbreviation'];
        //         if (i != allPositions.length - 1) {
        //             pos += '-';
        //         }
        //     }

        //     var atBats = batting['atBats'];
        //     var runs = batting['runs'];
        //     var hits = batting['hits'];
        //     var walks = batting['baseOnBalls'];
        //     var rbi = batting['rbi'];
        //     var homeRuns = batting['homeRuns'];
        //     var strikeOuts = batting['strikeOuts'];

        //     var avg = seasonBatting['avg'];
        //     var ops = seasonBatting['ops'];

        //     var currentBatterStyle = isCurrentBatter ? 'class="current-player"' : '';

        //     var boxscoreString = `<tr ${currentBatterStyle}><td>${battingOrder}${note}${playerLink(playerID, name)}</td><td>${jerseyNum}</td><td>${pos}</td><td>${atBats}</td><td>${runs}</td><td>${hits}</td><td>${walks}</td><td>${rbi}</td><td>${homeRuns}</td><td>${strikeOuts}</td><td>${avg}</td><td>${ops}</td></tr>`;

        //     return boxscoreString;
        // }

        // function pitcherRow(player) {
        //     var pitching = player['stats']['pitching'];
        //     var seasonPitching = player['seasonStats']['pitching'];

        //     var note = 'note' in pitching ? `&nbsp;${pitching['note']}` : '';
        //     var playerID = player['person']['id'];
        //     var jerseyNum = '';
        //     if ('jerseyNumber' in player && player['jerseyNumber'].length > 0) {
        //         jerseyNum = '#' + player['jerseyNumber'];
        //     }
        //     var name = player['person']['fullName'];

        //     var inningsPitched = pitching['inningsPitched'];
        //     var hits = pitching['hits'];
        //     var runs = pitching['runs'];
        //     var earnedRuns = pitching['earnedRuns'];
        //     var walks = pitching['baseOnBalls'];
        //     var strikeOuts = pitching['strikeOuts'];
        //     var homeRuns = pitching['homeRuns'];

        //     var era = seasonPitching['era'];

        //     var pitchingString = `<tr><td>${playerLink(playerID, name)}${note}</td><td>${jerseyNum}</td><td>${inningsPitched}</td><td>${hits}</td><td>${runs}</td><td>${earnedRuns}</td><td>${walks}</td><td>${strikeOuts}</td><td>${homeRuns}</td><td>${era}</td></tr>`;

        //     return pitchingString;
        // }

        // function boxscore(selectedGame, teamSide) {
        //     var players = selectedGame['liveData']['boxscore']['teams'][teamSide]['players'];
        //     var batters = selectedGame['liveData']['boxscore']['teams'][teamSide]['batters'];
        //     var currentBatter;
        //     try {
        //         currentBatter = selectedGame['liveData']['plays']['currentPlay']['matchup']['batter'];
        //     } catch {
        //         currentBatter = { 'id': null };
        //     }
        //     for (let i = 0; i < batters.length; i++) {
        //         var playerID = 'ID' + batters[i].toString();
        //         if (players[playerID]['position']['type'] != 'Pitcher') {
        //             boxscoreTable.append(boxscoreRow(players[playerID], (selectedGame['gameData']['status']['abstractGameState'] == 'Live') ? batters[i].toString() == currentBatter['id'] : false));
        //         }
        //     }

        //     var boxscoreTableData = tableToArray(boxscoreTable);
        //     if (boxscoreTableData != null) {
        //         var boxscoreTotalsRow = `<tr class='totals-row'><td>Totals</td><td></td><td></td>`;
        //         for (let i = 3; i <= 9; i++) {
        //             var sum = boxscoreTableData[i].reduce((sum, value) => sum + parseInt(value, 10), 0);
        //             boxscoreTotalsRow += `<td>${sum}</td>`;
        //         }
        //         boxscoreTotalsRow += '<td></td><td></td></tr>';
        //         boxscoreTable.append(boxscoreTotalsRow);
        //     }

        //     var pitchers = selectedGame['liveData']['boxscore']['teams'][teamSide]['pitchers'];
        //     for (let i = 0; i < pitchers.length; i++) {
        //         var playerID = 'ID' + pitchers[i].toString();
        //         if (!$.isEmptyObject(players[playerID]['stats']['pitching'])) {
        //             pitchersTable.append(pitcherRow(players[playerID]));
        //         }
        //     }

        //     var pitchersTableData = tableToArray(pitchersTable);
        //     if (pitchersTableData != null) {
        //         var pitchersTableRow = `<tr class='totals-row'><td>Totals</td><td></td>`;
        //         for (let i = 2; i <= 8; i++) {
        //             var sum = 0;
        //             if (i == 2) {
        //                 sum = pitchersTableData[i].reduce((sum, value) => sum + parseFloat(value, 10), 0);
        //                 var decimal = sum % 1;
        //                 if (decimal > 0.25) {
        //                     var extra = decimal / 3 * 10;
        //                     sum = sum - decimal + extra;
        //                 }
        //                 sum = sum.toFixed(1);
        //             } else {
        //                 sum = pitchersTableData[i].reduce((sum, value) => sum + parseInt(value, 10), 0);
        //             }
        //             pitchersTableRow += `<td>${sum}</td>`;
        //         }
        //         pitchersTableRow += '<td></td></tr>';
        //         pitchersTable.append(pitchersTableRow);
        //     }

        //     var details = selectedGame['liveData']['boxscore']['info'];
        //     detailsDiv.append(`<p class="details-title details-label">GAME NOTES</p>`);
        //     for (let i = 0; i < details.length; i++) {
        //         if ('value' in details[i]) {
        //             detailsDiv.append(`<p><span class="details-label">${details[i]['label']}:</span> ${details[i]['value']}</p>`);
        //         } else {
        //             detailsDiv.append(`<p><span class="details-label">${details[i]['label']}</span></p>`);
        //         }
        //     }
        // }
    }, [selectedGame]);

    // useEffect(() => {
    //     try {
    //         const boxscoreTable = $(document.querySelector('#boxscore'));

    //         boxscoreTable.find('tr td a').each(function () {
    //             if ($(this).text() == highlightedPlayer) {
    //                 $(this).closest('tr').addClass('selected-batter');
    //             } else {
    //                 $(this).closest('tr').removeClass('selected-batter');
    //             }
    //         });
    //     } catch {

    //     }
    // }, [highlightedPlayer]);

    return (
        <>
            {<Box sx={{ height: 40, display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                {currGame &&
                    <>
                        <Typography sx={{ fontSize: 'inherit', verticalAlign: 'middle' }}>{currGame ?
                            <>
                                {`${currGame?.gameData?.datetime?.officialDate} ${currGame?.gameData?.datetime?.time} ${currGame?.gameData?.datetime?.ampm}`}
                            </> : ''}</Typography>
                        <a target="_blank" rel="noopener noreferrer" href={`https://www.mlb.com/stories/game/${selectedGame}`}>
                            {'Recap'}<HiExternalLink style={{ verticalAlign: 'middle' }} />
                        </a>
                        <a target="_blank" rel="noopener noreferrer" href={gamedayUrl}>
                            {'mlb.com'}<HiExternalLink style={{ verticalAlign: 'middle' }} />
                        </a>
                    </>
                }
            </Box>}
            <table id="linescore">
                <thead>
                    <tr>
                        <th>Team</th>
                        {Array.from({ length: numInnings }).map((_, i) => {
                            const inningNum = i + 1;
                            return <th key={inningNum}>{inningNum}</th>
                        })}
                        <th>R</th>
                        <th>H</th>
                        <th>E</th>
                    </tr>
                </thead>
                <tbody>
                    <LinescoreRow currGame={currGame} team='away' />
                    <LinescoreRow currGame={currGame} team='home' />
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
                        <td>{currGame?.liveData?.decisions?.winner?.fullName ? <Link to='/players'>{currGame?.liveData?.decisions?.winner?.fullName}</Link> : '-'}   </td>
                        <td>{currGame?.liveData?.decisions?.loser?.fullName ? <Link to='/players'>{currGame?.liveData?.decisions?.loser?.fullName}</Link> : '-'}</td>
                        <td>{currGame?.liveData?.decisions?.save?.fullName ? <Link to='/players'>{currGame?.liveData?.decisions?.save?.fullName}</Link> : '-'}</td>
                    </tr>
                </tbody>
            </table>
            <table id="boxscore">
                <colgroup>
                    {Array.from({ length: 12 }).map((_, i) => {
                        return <col key={i} />
                    })}
                </colgroup>
                <thead>
                    <tr>
                        <th colSpan={12}>
                            <ToggleButtonGroup
                                color="primary"
                                value={displayValue}
                                exclusive
                                onChange={(e, nextView) => selectedSide && setSelectedSide(nextView)}
                                sx={{
                                    gap: 4,
                                    width: '100%',
                                    borderRadius: '50px',
                                    '& .MuiToggleButton-root': {
                                        borderRadius: 'inherit'
                                    },
                                }}
                                disabled={!currGame}
                            >
                                <ToggleButton size="large" value="away"
                                    sx={{
                                        width: '50%',
                                        '&.Mui-selected': {
                                            color: '#ffffff',
                                            borderColor: '#cccccc',
                                            fontWeight: 'bold'
                                        }
                                    }}>{currGame ?
                                        <>
                                            <img width="30" height="30" className="logo" src={`/teamLogos/${currGame?.gameData?.teams?.away?.abbreviation}.svg`} />
                                            {currGame?.gameData?.teams?.away?.teamName}
                                            {/* add standings */}
                                        </>
                                        :
                                        'Away'
                                    }
                                </ToggleButton>
                                <ToggleButton size="large" value="home"
                                    sx={{
                                        width: '50%',
                                        '&.Mui-selected': {
                                            color: '#ffffff',
                                            borderColor: '#cccccc',
                                            fontWeight: 'bold'
                                        }
                                    }}>
                                    {currGame ?
                                        <>
                                            <img width="30" height="30" className="logo" src={`/teamLogos/${currGame?.gameData?.teams?.home?.abbreviation}.svg`} />
                                            {currGame?.gameData?.teams?.home?.teamName}
                                            {/* add standings */}
                                        </>
                                        :
                                        'Home'
                                    }</ToggleButton>
                            </ToggleButtonGroup>
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
                    {currGame?.liveData?.boxscore?.teams?.[selectedSide]?.battingOrder.map((batterID, i) => {
                        const batter = currGame?.liveData?.boxscore?.teams?.[selectedSide]?.players?.[`ID${batterID}`];
                        const fullName = batter?.person?.fullName;
                        const jerseyNumber = batter?.jerseyNumber;
                        const position = batter?.position?.abbreviation;
                        const gameStats = batter?.stats?.batting;
                        const seasonStats = batter?.seasonStats?.batting;
                        return <tr key={batterID}>
                            <td><Link to='/players/?'>{fullName}</Link></td>
                            <td>#{jerseyNumber}</td>
                            <td>{position}</td>
                            <td>{gameStats?.atBats}</td>
                            <td>{gameStats?.runs}</td>
                            <td>{gameStats?.hits}</td>
                            <td>{gameStats?.baseOnBalls}</td>
                            <td>{gameStats?.rbi}</td>
                            <td>{gameStats?.homeRuns}</td>
                            <td>{gameStats?.strikeOuts}</td>
                            <td>{seasonStats?.avg}</td>
                            <td>{seasonStats?.ops}</td>
                        </tr>
                    })}
                </tbody>
                {(currGame && detailedState !== 'Scheduled') &&
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', borderTop: '1px solid white' }}>
                            <td>Totals</td><td></td><td></td>
                            <td>{teamStats?.[selectedSide].batting?.atBats}</td>
                            <td>{teamStats?.[selectedSide].batting?.runs}</td>
                            <td>{teamStats?.[selectedSide].batting?.hits}</td>
                            <td>{teamStats?.[selectedSide].batting?.baseOnBalls}</td>
                            <td>{teamStats?.[selectedSide].batting?.rbi}</td>
                            <td>{teamStats?.[selectedSide].batting?.homeRuns}</td>
                            <td>{teamStats?.[selectedSide].batting?.strikeOuts}</td>
                            <td></td><td></td>
                        </tr>
                    </tfoot>
                }
            </table>
            <Box id="info" sx={{ width: '600px', paddingX: 2, mb: 2 }}>
                <Stack>
                    {
                        currGame?.liveData?.boxscore?.teams?.[selectedSide].note.map((sub, i) => {
                            return <Typography key={i} sx={{ fontSize: 14 }}>
                                {sub.label} - {sub.value}
                            </Typography>
                        })
                    }
                </Stack>
            </Box>
            <Box id="info" sx={{ width: '600px', paddingX: 2, mb: 2 }}>
                {
                    currGame?.liveData?.boxscore?.teams?.[selectedSide].info.map((info, i) => {
                        return <Box key={i} sx={{ mb: 2 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>{info.title}</Typography>
                            <Stack>
                                {info.fieldList.map((event, j) => {
                                    return <Typography key={j} sx={{ fontSize: 14 }}>
                                        <b>{event.label}</b>: {event.value}
                                    </Typography>
                                })}
                            </Stack>
                        </Box>
                    })
                }
            </Box>
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
                    {currGame?.liveData?.boxscore?.teams?.[selectedSide]?.pitchers.map((pitcherID, i) => {
                        const pitcher = currGame?.liveData?.boxscore?.teams?.[selectedSide]?.players?.[`ID${pitcherID}`];
                        const fullName = pitcher?.person?.fullName;
                        const jerseyNumber = pitcher?.jerseyNumber;
                        const gameStats = pitcher?.stats?.pitching;
                        const seasonStats = pitcher?.seasonStats?.pitching;
                        return <tr key={pitcherID}>
                            <td><Link to='/players/?'>{fullName}</Link></td>
                            <td>#{jerseyNumber}</td>
                            <td>{gameStats.inningsPitched}</td>
                            <td>{gameStats.hits}</td>
                            <td>{gameStats.runs}</td>
                            <td>{gameStats.earnedRuns}</td>
                            <td>{gameStats.baseOnBalls}</td>
                            <td>{gameStats.strikeOuts}</td>
                            <td>{gameStats.homeRuns}</td>
                            <td>{seasonStats.era}</td>
                        </tr>
                    })}
                </tbody>
                {(currGame && detailedState !== 'Scheduled') &&
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', borderTop: '1px solid white' }}>
                            <td>Totals</td><td></td>
                            <td>{teamStats?.[selectedSide].pitching?.inningsPitched}</td>
                            <td>{teamStats?.[selectedSide].pitching?.hits}</td>
                            <td>{teamStats?.[selectedSide].pitching?.runs}</td>
                            <td>{teamStats?.[selectedSide].pitching?.earnedRuns}</td>
                            <td>{teamStats?.[selectedSide].pitching?.baseOnBalls}</td>
                            <td>{teamStats?.[selectedSide].pitching?.strikeOuts}</td>
                            <td>{teamStats?.[selectedSide].pitching?.homeRuns}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                }
            </table>

            {(currGame && ['Pre-Game', 'Scheduled'].includes(detailedState)) &&
                <>
                    <Box sx={{ width: '600px', paddingX: 2, mt: 2, mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 18 }}>PROBABLE PITCHERS</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Box sx={{ width: '275px' }}>
                                {awayPitcher ?
                                    <ProbablePitcher pitcher={awayPitcher} />
                                    : 'TBA'
                                }
                            </Box>
                            <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'white' }} />
                            <Box sx={{ width: '275px' }}>
                                {homePitcher ?
                                    <ProbablePitcher pitcher={homePitcher} />
                                    : 'TBA'
                                }
                            </Box>
                        </Box>
                    </Box>
                </>}
            <Box id="details" sx={{ width: '600px', paddingX: 2, mb: 2 }}>
                {currGame && <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>GAME NOTES</Typography>}
                {currGame?.liveData?.boxscore?.info?.map((detail, i) => {
                    return <Typography key={i} sx={{ fontSize: 14 }}>
                        <b>{detail?.label}</b>{detail?.value && ': '}{detail?.value}
                    </Typography>
                })
                }
            </Box>
        </>
    )
}