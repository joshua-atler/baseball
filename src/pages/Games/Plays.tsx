// @ts-nocheck

import * as React from 'react';
import ReactDOM from 'react-dom/client';

import { Box } from '@mui/material';

import $ from 'jquery';

import { Consts } from '../../consts/consts.ts';
import '../../styles/style.css';
import '../../styles/dtStyle.css';
import '../../styles/datepickerStyle.css';
import '../../styles/slimSelectStyle.css';


export default function Plays({ selectedGame, setHighlightedPlayer }) {

    React.useEffect(() => {
        (async () => {
            var newsDiv = $(document.querySelector('#news-content'));
            var playsOuterDiv = $(document.querySelector('#plays-outer'));
            var playsDiv = $(document.querySelector('#plays'));
            var inningCollapsibles;

            var strikeZoneData = [];
            const strikeZoneWidth = 180;
            const strikeZoneHeight = 240;

            var lastGameID = null;
            var currentGameID = null;

            var inningCollapsedState = [];
            var gameChanged;

            if (selectedGame == null) {
                newsDiv.html('<p>Select a game</p>');
                newsDiv.show();
                currentGameID = null;
                playsOuterDiv.hide();
                playsDiv.html('');
                return;
            } else {
                var gameDataWithBases = await fetch('https://statsapi.mlb.com' + `${selectedGame['link']}?hydrate=alignment`);
                gameDataWithBases = await gameDataWithBases.json();
                currentGameID = gameDataWithBases['gameData']['game']['pk'];
            }

            if (currentGameID != lastGameID) {
                inningCollapsedState = [];
                gameChanged = true;
            } else {
                gameChanged = false;
            }
            lastGameID = currentGameID;

            strikeZoneData = [];
            if (gameDataWithBases == null || gameDataWithBases['liveData']['plays']['playsByInning'].length == 0) {
                newsDiv.html('<p>No content</p>');
                newsDiv.show();
                playsOuterDiv.hide();
                playsDiv.html('');

            } else {
                newsDiv.hide();
                playsOuterDiv.show();

                plays(gameDataWithBases);

                fillStrikeZones();

                if (gameChanged) {
                    collapsibleScript(null);
                } else {
                    collapsibleScript(inningCollapsedState);
                }
            }

            function plays(gameData) {
                var playsByInning = gameData['liveData']['plays']['playsByInning'];
                var allPlays = gameData['liveData']['plays']['allPlays'];
                var playsContent = '';
                var playsInHalf = '';

                for (var i = 0; i < playsByInning.length; i++) {
                    var inningPlays = playsByInning[i];
                    if ('top' in inningPlays) {
                        if (gameChanged) {
                            inningCollapsedState.push(false);
                        }
                        playsInHalf = '';
                        for (let j = 0; j < playsByInning[i]['top'].length; j++) {
                            var thisPlay = playsByInning[i]['top'][j];
                            var nextPlay = (j != playsByInning[i]['top'].length - 1) ? playsByInning[i]['top'][j + 1] : null;
                            playsInHalf += playData(allPlays[thisPlay], allPlays[nextPlay]);
                            if (gameChanged) {
                                inningCollapsedState.push(false);
                            }
                        }

                        if (playsInHalf.length > 0) {
                            var awayTeamName = gameData['gameData']['teams']['away']['name'];
                            playsContent += `
                            <button class="collapsible"><img width="30" height="30" class="logo" src="${Consts.teamsDetails[awayTeamName].logo}"> &#9650; Top ${i + 1}</button>
                            <div class="inning-content">
                                ${playsInHalf}
                            </div>`;
                        }
                    }
                    if ('bottom' in inningPlays) {
                        if (gameChanged) {
                            inningCollapsedState.push(false);
                        }
                        playsInHalf = '';
                        for (let j = 0; j < playsByInning[i]['bottom'].length; j++) {
                            var thisPlay = playsByInning[i]['bottom'][j];
                            var nextPlay = (j != playsByInning[i]['bottom'].length - 1) ? playsByInning[i]['bottom'][j + 1] : null;
                            playsInHalf += playData(allPlays[thisPlay], allPlays[nextPlay]);
                            if (gameChanged) {
                                inningCollapsedState.push(false);
                            }
                        }

                        if (playsInHalf.length > 0) {
                            var homeTeamName = gameData['gameData']['teams']['home']['name'];
                            playsContent += `
                            <button class="collapsible"><img width="30" height="30" class="logo" src="${Consts.teamsDetails[homeTeamName].logo}"> &#9660; Bottom ${i + 1}</button>
                            <div class="inning-content">
                                ${playsInHalf}
                            </div>`;
                        }
                    }
                }
                playsDiv.html(playsContent);

                playsDiv.find('div.inning-content button').each(function () {
                    var batter = $(this).data('batter');

                    $(this).on('mouseenter', async () => {
                        setHighlightedPlayer(batter);
                    });
                    $(this).next().on('mouseenter', async () => {
                        setHighlightedPlayer(batter);
                    });

                    $(this).on('mouseleave', async () => {
                        setHighlightedPlayer(null);
                    });
                    $(this).next().on('mouseleave', async () => {
                        setHighlightedPlayer(null);
                    });
                });
            }

            function playData(play, nextPlay) {
                var style = '';
                if (play['about']['isScoringPlay'] == true) {
                    style = 'background-color: #005000;';
                }

                var playEvent = play['result']['event'];
                var playDescription = play['result']['description'];

                if (playEvent === undefined) {
                    playEvent = 'In progress';
                    playDescription = `${play['matchup']['batter']['fullName']} currently at bat`;
                }

                var baseRunnersSvg = '';
                if (nextPlay !== undefined) {
                    var baseRunners = {};
                    try {
                        baseRunners = nextPlay['playEvents'][nextPlay['pitchIndex'][nextPlay['pitchIndex'].length - 1]]['offense'];
                    } catch { }
                    // doesn't work for current at bats?
                    var baseData = [['#888888', '#AAAAAA'], ['#888888', '#AAAAAA'], ['#888888', '#AAAAAA']];
                    if ('first' in baseRunners) {
                        baseData[2][0] = '#EFB21F';
                        baseData[2][1] = '#EFB21F';
                    }
                    if ('second' in baseRunners) {
                        baseData[1][0] = '#EFB21F';
                        baseData[1][1] = '#EFB21F';
                    }
                    if ('third' in baseRunners) {
                        baseData[0][0] = '#EFB21F';
                        baseData[0][1] = '#EFB21F';
                    }

                    baseRunnersSvg = `<svg class="svg" width="35" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16.25" aria-label="base"><title>Bases.</title>
                <rect fill="${baseData[0][0]}" stroke-width="1" stroke="${baseData[0][1]}" width="6" height="6" transform="translate(5, 7.25) rotate(-315)" rx="1px" ry="1px"></rect>
                <rect fill="${baseData[1][0]}" stroke-width="1" stroke="${baseData[1][1]}" width="6" height="6" transform="translate(12, 0.5) rotate(-315)" rx="1px" ry="1px"></rect>
                <rect fill="${baseData[2][0]}" stroke-width="1" stroke="${baseData[2][1]}" width="6" height="6" transform="translate(19, 7.25) rotate(-315)" rx="1px" ry="1px"></rect>
                </svg>`;
                }

                var outs = play['count']['outs'];
                var outsIcons = '<span style="color: #EFB21F">&#11044;</span>'.repeat(outs) + '<span style="color: #888888">&#11044;</span>'.repeat(3 - outs);

                var scores = '';
                if (play['about']['isScoringPlay']) {
                    scores = `${selectedGame['gameData']['teams']['away']['abbreviation']} ${play['result']['awayScore']}, ${selectedGame['gameData']['teams']['home']['abbreviation']} ${play['result']['homeScore']}`;
                }

                var playString = `<button
                class="collapsible" style="${style}" data-batter="${play['matchup']['batter']['fullName']}">
                    <span class="svg-container">
                        <span>
                            ${playEvent}
                        </span>
                        <span class="svg-span">
                            ${baseRunnersSvg}
                            <span class="outs">${outsIcons}</span>
                            <span class="scores">${scores}</span>
                        </span>
                    </span>
                </button>`;

                playString += '<div class="play-data">';
                var strikeZoneTop = 3;
                var strikeZoneBottom = 1;
                strikeZoneData.push([]);

                playString += `<p>${playDescription}</p>`;
                playString += '<table class="pitches"><tbody>';

                var firstPitch = true;

                if (play['pitchIndex'].length == 0) {
                    if (firstPitch) {
                        strikeZoneData[strikeZoneData.length - 1].push([3, 1]);
                        firstPitch = false;
                    }
                }
                var pitchIndex = 1;
                for (let i = 0; i < play['playEvents'].length; i++) {
                    var playEvent = play['playEvents'][i];
                    var playDetails = '';

                    if (playEvent['isPitch']) {
                        var pitch = playEvent;
                        var pitchDesc = '';
                        try {
                            var pitchDesc = pitch['details']['description'];
                            var pitchType = '';
                            if ('type' in pitch['details']) {
                                pitchType = pitch['details']['type']['description'];
                            }
                            var count = `${pitch['count']['balls']}-${pitch['count']['strikes']}`;
                            if (i == play['pitchIndex'].length - 1 && pitch['details']['isInPlay']) {
                                count = '';
                            }
                            var speed = '';
                            if ('pitchData' in pitch) {
                                if ('startSpeed' in pitch['pitchData']) {
                                    speed = `${pitch['pitchData']['startSpeed']} mph`;
                                }
                            }

                            var playDetails = `
                            <td>
                                ${pitch['isPitch'] ? `<div class="pitch-circle" style="background-color: ${pitch['details']['ballColor']}">${pitchIndex}</div>` : ''}
                            </td>
                            <td>
                                <span class="pitch-bold">${pitchDesc}<br>${speed}</span>
                                ${pitchType}
                            </td>
                            <td><span class="pitch-bold">${count}</span></td>
                            `;

                            if ('pitchData' in pitch) {
                                strikeZoneTop = Math.round(pitch['pitchData']['strikeZoneTop'] * 1000) / 1000;
                                strikeZoneBottom = Math.round(pitch['pitchData']['strikeZoneBottom'] * 1000) / 1000;
                            } else {
                                strikeZoneTop = 3;
                                strikeZoneBottom = 1;
                            }

                            if (firstPitch) {
                                strikeZoneData[strikeZoneData.length - 1].push([strikeZoneTop, strikeZoneBottom]);
                            }
                            strikeZoneData[strikeZoneData.length - 1].push([
                                Math.round(pitch['pitchData']['coordinates']['pX'] * 1000) / 1000,
                                Math.round(pitch['pitchData']['coordinates']['pZ'] * 1000) / 1000,
                                pitch['details']
                            ]);
                            pitchIndex += 1;
                        } catch (error) {
                            var pitchDesc = pitch['details']['description'];
                            playDetails = `${pitchDesc}`;
                        }

                        firstPitch = false;
                    } else {
                        var desc = playEvent['details']['description'];
                        var icon = '';

                        if (firstPitch) {
                            strikeZoneTop = 3;
                            strikeZoneBottom = 1;
                            strikeZoneData[strikeZoneData.length - 1].push([strikeZoneTop, strikeZoneBottom]);
                            firstPitch = false;
                        }

                        if (desc !== undefined) {
                            if (desc.includes('steals')) {
                                icon = Consts.pitchIcons['steals'];
                            } else if (desc.includes('error')) {
                                icon = Consts.pitchIcons['error'];
                            } else if (desc.includes('replaces') || desc.includes('switch')) {
                                icon = Consts.pitchIcons['switch'];
                            } else if (desc.includes('Visit') || desc.includes('Timeout') || desc.includes('Step Off')) {
                                icon = Consts.pitchIcons['pause'];
                            } else if (desc.includes('Status Change')) {
                                icon = Consts.pitchIcons['status'];
                            } else if (desc.includes('caught') || desc.includes('Automatic')) {
                                icon = Consts.pitchIcons['caught'];
                            } else if (desc.includes('remains')) {
                                icon = Consts.pitchIcons['remains'];
                            } else if (desc.includes('Pickoff Attempt') || desc.includes('picks off') || desc.includes('Wild pitch') || desc.includes('Passed ball') || desc.includes('Delay')) {
                                icon = Consts.pitchIcons['warning'];
                            } else if (desc.includes('Timer Violation')) {
                                icon = Consts.pitchIcons['timer'];
                            } else {
                            }
                        }

                        playDetails = `<td class="play-icon">${icon}<td>${desc}</td>`;
                    }
                    
                    if ('playId' in playEvent) {
                        var pitchLink = `<a href="https://baseballsavant.mlb.com/sporty-videos?playId=${playEvent['playId']}" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#374bfb"><path d="M216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-528q0-29.7 21.15-50.85Q186.3-816 216-816h264v72H216v528h528v-264h72v264q0 29.7-21.15 50.85Q773.7-144 744-144H216Zm171-192-51-51 357-357H576v-72h240v240h-72v-117L387-336Z"/></svg></a>`;
                        if (!playEvent['isPitch']) {
                            playDetails = `${playDetails}<td></td>`;
                        }
                        playDetails = `${playDetails}<td>${pitchLink}</td>`;
                    }
                    playString += `<tr>${playDetails}</tr>`;

                }

                playString += '</tbody></table>';
                playString += `<canvas class="strike-zone" width="${strikeZoneWidth}" height="${strikeZoneHeight}"></canvas>`;
                playString += '</div>';

                return playString;
            }

            function collapsibleScript(previousState) {
                inningCollapsibles = $(document.querySelectorAll('.collapsible'));
                for (let i = 0; i < inningCollapsibles.length; i++) {
                    if (previousState != null) {
                        if (previousState[i] == true) {
                            inningCollapsibles[i].classList.toggle('collapsible-active');
                            setExpandedState(inningCollapsibles[i]);
                        }
                    }
                    inningCollapsibles[i].addEventListener('click', function () {
                        inningCollapsibles[i].classList.toggle('collapsible-active');
                        inningCollapsedState[i] = !inningCollapsedState[i];

                        setExpandedState(inningCollapsibles[i]);
                    });
                }
            }

            function setExpandedState(collapsible) {
                var content = collapsible.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    if (content.className == 'play-data') {
                        var parent = content.parentElement;
                        parent.style.maxHeight = 5000 + 'px';
                    }
                }
            }

            function fillStrikeZones() {
                var strikeZones = $(document.querySelectorAll('.strike-zone'));

                var strikeZoneCenterX = strikeZoneWidth / 2;
                var strikeZoneCenterY = strikeZoneHeight / 2;
                var strikeZoneSide = 17 / 24;
                var sizeMult = 55;

                for (let i = 0; i < strikeZones.length; i++) {
                    var strikeZone = strikeZones[i].getContext('2d');

                    var strikeZoneTop = strikeZoneData[i][0][0];
                    var strikeZoneBottom = strikeZoneData[i][0][1];
                    var strikeZoneVertSize = strikeZoneTop - strikeZoneBottom;
                    var strikeZoneCanvasLeft = strikeZoneCenterX - strikeZoneSide * sizeMult;
                    var strikeZoneCanvasRight = strikeZoneCenterX + strikeZoneSide * sizeMult;
                    var strikeZoneCanvasTop = strikeZoneCenterY - strikeZoneVertSize / 2 * sizeMult;
                    var strikeZoneCanvasBottom = strikeZoneCenterY + strikeZoneVertSize / 2 * sizeMult;

                    strikeZone.strokeStyle = 'white';
                    strikeZone.beginPath();

                    strikeZone.moveTo(strikeZoneCanvasLeft, strikeZoneCanvasTop);
                    strikeZone.lineTo(strikeZoneCanvasLeft, strikeZoneCanvasBottom);
                    strikeZone.stroke();

                    strikeZone.beginPath();
                    strikeZone.moveTo(strikeZoneCanvasRight, strikeZoneCanvasTop);
                    strikeZone.lineTo(strikeZoneCanvasRight, strikeZoneCanvasBottom);
                    strikeZone.stroke();

                    strikeZone.beginPath();
                    strikeZone.moveTo(strikeZoneCanvasLeft, strikeZoneCanvasTop);
                    strikeZone.lineTo(strikeZoneCanvasRight, strikeZoneCanvasTop);
                    strikeZone.stroke();

                    strikeZone.beginPath();
                    strikeZone.moveTo(strikeZoneCanvasLeft, strikeZoneCanvasBottom);
                    strikeZone.lineTo(strikeZoneCanvasRight, strikeZoneCanvasBottom);
                    strikeZone.stroke();

                    for (let j = 1; j < strikeZoneData[i].length; j++) {

                        var topY = strikeZoneCenterY - strikeZoneVertSize / 2 * sizeMult;
                        var bottomY = strikeZoneCenterY + strikeZoneVertSize / 2 * sizeMult;
                        var percentFromBottomY = (strikeZoneData[i][j][1] - strikeZoneBottom) / strikeZoneVertSize;

                        var pitchX = strikeZoneCenterX + strikeZoneData[i][j][0] * sizeMult;
                        var pitchY = bottomY - (percentFromBottomY * (bottomY - topY));

                        strikeZone.beginPath();
                        strikeZone.arc(pitchX, pitchY, 8, 0, 2 * Math.PI);
                        strikeZone.fillStyle = strikeZoneData[i][j][2]['ballColor'];
                        strikeZone.fill();
                        strikeZone.lineWidth = 2;
                        strikeZone.strokeStyle = 'white';
                        strikeZone.stroke();
                        strikeZone.font = '14px Arial';
                        strikeZone.fillStyle = 'white';
                        strikeZone.fillText(j, pitchX - 5, pitchY + 5);
                    }
                }
            }
        })();
    }, [selectedGame]);

    return (
        <>
            <div id="news-content">
                <p>Select a game</p>
            </div>
            <div id="plays-outer" style={{ display: 'none' }}>
                <div id="plays-inner">
                    <div id="plays"></div>
                </div>
            </div>
        </>
    )
}