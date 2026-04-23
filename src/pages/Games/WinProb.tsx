// @ts-nocheck

import { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { Box, Typography } from '@mui/material';

import $ from 'jquery';

import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Consts } from '../../consts/consts.ts';
import '../../styles/style.css';
import { data } from 'react-router';
import { useBasedash } from '../../context/BasedashContext.tsx';
import { useTheme } from '@mui/material/styles';
import { GameTabContent } from '../../components/GameTabContent.tsx';
import { fetchGame, fetchWinProbability } from '../../services/gamesService.ts';

function rgbaColor(color) {
    let rgbaColor = 'rgba(R, G, B, 0.3)';
    rgbaColor = rgbaColor.replace('R', color.split('(')[1].split(',')[0]);
    rgbaColor = rgbaColor.replace('G', color.split(' ')[1].split(',')[0]);
    rgbaColor = rgbaColor.replace('B', color.split(', ')[2].split(')')[0]);
    return rgbaColor;
}

export default function WinProb({ }) {

    const theme = useTheme();
    const { selectedGame } = useBasedash();

    const [errorLoadingChart, setErrorLoadingChart] = useState(false);

    const chartRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {

        const getWinProb = async () => {
            if (chartRef.current !== null) {
                chartRef.current.destroy();
            }

            try {
                const gameContent = await fetchGame(selectedGame);
                const winProbData = await fetchWinProbability(selectedGame);

                const existingChart = Chart.getChart(canvasRef.current);
                if (existingChart) {
                    existingChart.destroy();
                }

                // move this to a transformers file

                if (chartRef.current) {
                    chartRef.current.destroy();
                }

                const awayTeam = gameContent.gameData.teams.away;
                const homeTeam = gameContent.gameData.teams.home;

                const awayTeamAbbr = awayTeam.abbreviation;
                const homeTeamAbbr = homeTeam.abbreviation;

                const awayTeamIndex = Consts.findTeamIndex(awayTeam['name'] === 'Athletics' ? 'Oakland Athletics' : awayTeam['name']);
                const homeTeamIndex = Consts.findTeamIndex(homeTeam['name'] === 'Athletics' ? 'Oakland Athletics' : homeTeam['name']);

                const awayTeamColors = [
                    Consts.teamInfo[awayTeam.abbreviation].primary,
                    Consts.teamInfo[awayTeam.abbreviation].secondary,
                ];
                const homeTeamColors = [
                    Consts.teamInfo[homeTeam.abbreviation].primary,
                    Consts.teamInfo[homeTeam.abbreviation].secondary,
                ];

                const shadedRegions = {};

                let prevInning = { half: 'top', num: 1 };
                let prevAtBatIndex = 0;
                for (let i = 0; i < winProbData.length; i++) {
                    const atBatIndex = winProbData[i]['about']['atBatIndex'];
                    const currInning = { half: winProbData[i]['about']['halfInning'], num: winProbData[i]['about']['inning'] };
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

                const labels = [];
                const homeTeamWinProbs = [];
                for (let play of winProbData) {
                    labels.push(play['atBatIndex'] + 1);
                    homeTeamWinProbs.push(play['homeTeamWinProbability']);
                }

                Chart.register(annotationPlugin);
                const ctx = canvasRef.current.getContext('2d');
                chartRef.current = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: `${homeTeamAbbr} Winning %`,
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
                            tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: '#fff',
                                bodyColor: '#fff',
                                callbacks: {
                                    title: function (context) {
                                        return `${parseFloat(context[0]['raw']).toFixed(1)}%`;
                                    },
                                    label: function (context) {
                                        const dataAtIndex = winProbData[context['dataIndex']];
                                        const label = dataAtIndex['result']['description'];
                                        return label;
                                    },
                                    footer: function (context) {
                                        const dataAtIndex = winProbData[context[0]['dataIndex']];
                                        const footer = `${dataAtIndex['about']['halfInning']} ${dataAtIndex['about']['inning']}\n${awayTeamAbbr}: ${dataAtIndex['result']['awayScore']}, ${homeTeamAbbr}: ${dataAtIndex['result']['homeScore']}`;
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
                setErrorLoadingChart(false);
            } catch (err) {
                console.error('Failed to load chart:', err.message);
                setErrorLoadingChart(true);
            }


            return () => {
                const activeChart = Chart.getChart(canvasRef.current);
                if (activeChart) activeChart.destroy();
                if (chartRef.current) {
                    chartRef.current.destroy();
                    chartRef.current = null;
                }
            };
        }

        getWinProb();
    }, [selectedGame]);



    return (
        <GameTabContent>
            {!errorLoadingChart ?
                <>
                    <canvas ref={canvasRef} />
                </> : <>
                    <Typography variant="h5">No content</Typography>
                </>}
        </GameTabContent>
    )
}
