// @ts-nocheck

import * as React from 'react';
import ReactDOM from 'react-dom/client';

import { Box } from '@mui/material';

import $ from 'jquery';

import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Consts } from '../../consts/consts.ts';
import '../../styles/style.css';
import { data } from 'react-router';


export default function WinProb({ gamePk }) {

    React.useEffect(() => {
        (async () => {
            var newsDiv = $(document.querySelector('#news-content'));

            Chart.register(annotationPlugin);
            var winProbChartCanvas = $(document.querySelector('#win-prob-chart canvas'));
            var winProbChart = Chart.getChart(winProbChartCanvas);

            if (winProbChart) {
                try {
                    winProbChart.destroy();
                } catch (error) {
                    console.error("Failed to destroy chart:", error);
                }
            }

            var winProb = null;

            if (gamePk == null) {
                newsDiv.html('<p>Select a game</p>');
                newsDiv.show();
                $(document.querySelector('#win-prob-chart')).hide();
            } else {
                newsDiv.hide();
                $(document.querySelector('#win-prob-chart')).show();
                fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/winProbability`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(winProbData => {
                        fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(gameData => {
                                var awayTeam = gameData['gameData']['teams']['away'];
                                var homeTeam = gameData['gameData']['teams']['home'];

                                var awayTeamClubName = awayTeam['clubName'];
                                var homeTeamClubName = homeTeam['clubName'];

                                var awayTeamAbbr = awayTeam['abbreviation'];
                                var homeTeamAbbr = homeTeam['abbreviation'];

                                var awayTeamIndex = Consts.findTeamIndex(awayTeam['name'] === 'Athletics' ? 'Oakland Athletics' : awayTeam['name']);
                                var homeTeamIndex = Consts.findTeamIndex(homeTeam['name'] === 'Athletics' ? 'Oakland Athletics' : homeTeam['name']);

                                var awayTeamColors = [
                                    Consts.teamColors[awayTeamIndex[0]][awayTeamIndex[1]][awayTeamIndex[2]],
                                    Consts.teamSecondColors[awayTeamIndex[0]][awayTeamIndex[1]][awayTeamIndex[2]]
                                ];
                                var homeTeamColors = [
                                    Consts.teamColors[homeTeamIndex[0]][homeTeamIndex[1]][homeTeamIndex[2]],
                                    Consts.teamSecondColors[homeTeamIndex[0]][homeTeamIndex[1]][homeTeamIndex[2]]
                                ];

                                function rgbaColor(color) {
                                    var rgbaColor = 'rgba(R, G, B, 0.3)';
                                    rgbaColor = rgbaColor.replace('R', color.split('(')[1].split(',')[0]);
                                    rgbaColor = rgbaColor.replace('G', color.split(' ')[1].split(',')[0]);
                                    rgbaColor = rgbaColor.replace('B', color.split(', ')[2].split(')')[0]);
                                    return rgbaColor;
                                }

                                var shadedRegions = {};

                                var prevInning = { half: 'top', num: 1 };
                                var prevAtBatIndex = 0;
                                for (let i = 0; i < winProbData.length; i++) {
                                    var atBatIndex = winProbData[i]['about']['atBatIndex'];
                                    var currInning = { half: winProbData[i]['about']['halfInning'], num: winProbData[i]['about']['inning'] };
                                    if (!(currInning.half === prevInning.half && prevInning.num === prevInning.num) || i == winProbData.length - 1) {
                                        shadedRegions[`${prevInning.half} ${prevInning.num}`] = {
                                            type: 'box',
                                            xMin: prevAtBatIndex,
                                            xMax: atBatIndex,
                                            backgroundColor: prevInning.half === 'top' ? rgbaColor(awayTeamColors[0]) : rgbaColor(homeTeamColors[0]),
                                            borderColor: prevInning.half === 'top' ? awayTeamColors[0] : homeTeamColors[0],
                                            borderWidth: 1
                                        };
                                        prevInning = currInning;
                                        prevAtBatIndex = atBatIndex;
                                    }
                                }

                                var labels = [];
                                var homeTeamWinProbs = [];
                                for (let play of winProbData) {
                                    labels.push(play['atBatIndex'] + 1);
                                    homeTeamWinProbs.push(play['homeTeamWinProbability']);
                                }

                                winProbChart = new Chart(winProbChartCanvas, {
                                    type: 'line',
                                    data: {
                                        labels: labels,
                                        datasets: [
                                            {
                                                label: `${homeTeamClubName} Winning %`,
                                                data: homeTeamWinProbs,
                                                backgroundColor: homeTeamColors[0],
                                                borderColor: 'white',
                                                borderWidth: 1,
                                            }
                                        ]
                                    },
                                    options: {
                                        layout: {
                                            padding: {
                                                left: 15,
                                                right: 30
                                            }
                                        },
                                        scales: {
                                            y: {
                                                min: 0,
                                                max: 100,
                                                ticks: {
                                                    color: 'white'
                                                }
                                            },
                                            x: {
                                                title: {
                                                    display: true,
                                                    text: 'At Bat #',
                                                    color: 'white',
                                                    font: {
                                                        size: 18
                                                    }
                                                },
                                                ticks: {
                                                    color: 'white'
                                                }
                                            }
                                        },
                                        plugins: {
                                            // title: {
                                            //     display: true,
                                            //     text: '{home team} Winning %',
                                            //     color: 'white',
                                            //     font: {
                                            //         size: 21
                                            //     }
                                            // },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                titleColor: '#fff',
                                                bodyColor: '#fff',
                                                callbacks: {
                                                    title: function (context) {
                                                        return `${parseFloat(context[0]['raw']).toFixed(1)}%`;
                                                    },
                                                    label: function (context) {
                                                        var dataAtIndex = winProbData[context['dataIndex']];
                                                        var label = dataAtIndex['result']['description'];
                                                        return label;
                                                    },
                                                    footer: function (context) {
                                                        var dataAtIndex = winProbData[context[0]['dataIndex']];
                                                        var footer = `${dataAtIndex['about']['halfInning']} ${dataAtIndex['about']['inning']}\n${awayTeamAbbr}: ${dataAtIndex['result']['awayScore']}, ${homeTeamAbbr}: ${dataAtIndex['result']['homeScore']}`;
                                                        return footer;
                                                    }
                                                }
                                            },
                                            legend: {
                                                labels: {
                                                    color: 'white',
                                                    font: {
                                                        size: 18
                                                    }
                                                },
                                            },
                                            annotation: {
                                                annotations: {
                                                    ...shadedRegions,
                                                }
                                            }
                                        }
                                    }
                                });
                            })
                    })
            }
        })();
    }, [gamePk]);

    return (
        <>
            <div id="news-content">
                <p>Select a game</p>
            </div>
            <div id="win-prob-chart">
                <canvas></canvas>
            </div>
        </>
    )
}
