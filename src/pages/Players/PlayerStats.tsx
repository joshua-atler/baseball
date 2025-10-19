// @ts-nocheck

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom/client';

import {
    Box,
    Typography,
    Chip,
    Stack,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Switch,
    FormControlLabel,
    Modal,
    Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import $ from 'jquery';
import 'datatables.net-dt';
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
import Chart from 'chart.js/auto';
import SlimSelect from 'slim-select';

import { Consts } from '../../consts/consts.ts';
import '../../styles/style.css';
import '../../styles/dtStyle.css';
import '../../styles/slimSelectStyle.css';
import '../../styles/cssToggleSwitchStyle.css';


function AwardCard({ award, teams, dates }) {
    return (
        <Card>
            <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                    {award}
                </Typography>
                {teams.map((team, index) => (
                    <Box key={index} display="flex" gap={2} justifyContent="space-between">
                        <Typography variant="body1">{team}</Typography>
                        <Typography variant="body1">{dates[index]}</Typography>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
}

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


function StatsModal({ open, handleClose, modalData }) {

    const canvasRef = React.useRef(null);

    React.useEffect(() => {
        if (!open) return;
        setTimeout(() => {
            const statsModalLineChartCanvas = document.querySelector('#stats-modal-chart canvas');
            var statsModalLineChart = null;

            if (Object.keys(modalData).length === 0) {
                statsModalLineChart?.destroy();
            } else {
                statsModalLineChart = new Chart(statsModalLineChartCanvas, {
                    type: 'line',
                    data: {
                        labels: [...modalData.years].reverse(),
                        datasets: [{
                            data: [...modalData.columnData].reverse(),
                            label: ''
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                border: {
                                    display: false
                                },
                                ticks: {
                                    color: 'white',
                                    font: {
                                        size: 18
                                    }
                                },
                                grid: {
                                    color: 'white',
                                    z: 1
                                }
                            },
                            y: {
                                ticks: {
                                    color: 'white',
                                    font: {
                                        size: 18
                                    }
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false,
                            }
                        }
                    }
                });
            }
        }, 50);
    }, [open, modalData]);

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <h2>{modalData.statTitle}</h2>
                <div id="stats-modal-chart">
                    <canvas ref={canvasRef}></canvas>
                </div>
                <Button onClick={handleClose}>Close</Button>
            </Box>
        </Modal>
    );
}

export default function PlayerStats({ selectedPlayer, setSelectedGame }) {
    const navigate = useNavigate();
    const awardsContainerRef = React.useRef(null);
    const awardsRef = React.useRef(null);
    const [playerPosition, setPlayerPosition] = React.useState('');
    const [seasonPitchingForAllYears, setSeasonPitchingForAllYears] = React.useState([]);
    const [seasonPitching, setSeasonPitching] = React.useState({});
    const [careerPitching, setCareerPitching] = React.useState({});
    const [selectedYear, setSelectedYear] = React.useState(2025);
    const [allYearsChecked, setAllYearsChecked] = React.useState(false);
    const [modalOpen, setModalOpen] = React.useState(false);
    const [modalData, setModalData] = React.useState({});

    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => {
        setModalOpen(false);
        setModalData({});
    }

    var pitchingStatsDT;
    var pitchingGameLogDT;

    var playerID = null;
    var playerStats = null;
    var teamColor = null;

    const svgUpArrow = '<svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#ffffff" style="position: absolute; left: 50px;" data-direction="up"><path d="m280-400 200-200 200 200H280Z"/></svg>';

    const svgDownArrow = '<svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#ffffff" style="position: absolute; left: 50px;" data-direction="down"><path d="M480-360 280-560h400L480-360Z"/></svg>';

    function formatDate(originalDate) {
        const date = new Date(originalDate);
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${day}/${year}`;
    }

    function fixName(name) {
        var cleanName = name.toLowerCase();
        cleanName = cleanName.replace(/ /g, "-");
        cleanName = cleanName.replace(/'/g, "-");
        var match = cleanName.match(/\./g);
        if (match && match.length == 2) {
            cleanName = cleanName.replace(/\./, '-');
        }
        cleanName = cleanName.replace(/\./g, "");
        cleanName = cleanName.normalize("NFD");
        cleanName = cleanName.replace(/[\u0300-\u036f]/g, "").replace(/ñ/g, "n");

        return cleanName;
    }

    function pitchColors(pitchType) {
        var pitchColorsTable = {
            'FA': 'rgba(55, 160, 235, 0.8)',
            'FF': 'rgba(55, 160, 235, 0.8)',
            'FC': 'rgba(255, 100, 130, 0.8)',
            'FS': 'rgba(75, 200, 200, 0.8)',
            'SI': 'rgba(255, 160, 60, 0.8)',
            'ST': 'rgba(50, 100, 150, 0.8)',
            'SL': 'rgba(100, 200, 50, 0.8)',
            'CU': 'rgba(255, 200, 85, 0.8)',
            'KC': 'rgba(85, 255, 200, 0.8)',
            'CH': 'rgba(100, 50, 255, 0.8)',
        };

        if (pitchType in pitchColorsTable) {
            return pitchColorsTable[pitchType];
        } else {
            return 'rgba(0, 0, 0, 0.8)';
        }
    }

    function hitColors(hitType) {
        var hitColorsTable = {
            'Single': 'rgba(55, 160, 235, 0.8)',
            'Double': 'rgba(255, 100, 130, 0.8)',
            'Triple': 'rgba(100, 200, 50, 0.8)',
            'Home Run': 'rgba(200, 0, 0, 0.8)'
        };

        if (hitType in hitColorsTable) {
            return hitColorsTable[hitType];
        } else {
            return 'rgba(0, 0, 0, 0.8)';
        }
    }

    function formatInnings(num) {
        let wholePart = Math.floor(num);
        let fractionalPart = num - wholePart;
        const tolerance = 1e-9;

        let fraction = '';
        if (Math.abs(fractionalPart - 1 / 3) < tolerance) {
            fraction = '.1';
        } else if (Math.abs(fractionalPart - 2 / 3) < tolerance) {
            fraction = '.2';
        } else {
            fraction = '.0';
        }

        return wholePart + fraction;
    }

    function loadSVGToImage(svgText) {
        return new Promise((resolve, reject) => {
            // const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);

            const img = new Image();
            img.src = svgText;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Error loading SVG image'));
        });
    }

    function allYearsToggle(event) {
        setAllYearsChecked(event.target.checked);
        openCloseAllYears(event.target.checked);
    }

    function openCloseAllYears(allYears) {
        if (allYears) {
            if (playerPosition == 'Pitcher') {
                updatePitchingStatsTable([...seasonPitchingForAllYears, careerPitching]);
            } else {
                // TODO: hitting
            }
        } else {
            if (playerPosition == 'Pitcher') {
                updatePitchingStatsTable(seasonPitching !== undefined
                    ? [seasonPitching, careerPitching]
                    : [careerPitching]);
            } else {
                // TODO: pitching
            }
        }
    }
    openCloseAllYears(allYearsChecked);

    function updatePitchingStatsTable(seasonsPitching) {
        pitchingStatsDT = $(document.querySelector('#pitching-stats')).DataTable();
        pitchingStatsDT.clear();

        var dropdownRowIndices = [];
        var subRowIndices = [];
        var rowIndex = 0;

        // console.log('seasonsPitching');
        // console.log(seasonsPitching);

        for (let i = 0; i < seasonsPitching.length; i++) {
            var splits;
            if (seasonsPitching[i]['splits'].length > 1) {
                splits = [seasonsPitching[i]['splits'][0], ...seasonsPitching[i]['splits'].slice(1)];
            } else {
                splits = seasonsPitching[i]['splits'];
            }

            for (let j = 0; j < splits.length; j++) {
                var pitchingRow = splits[j];
                var seasonYear;
                if ('season' in pitchingRow) {
                    seasonYear = pitchingRow['season'];
                } else {
                    seasonYear = 'Career';
                }

                var team;
                if (seasonYear == 'Career') {
                    team = '';
                } else if ('team' in pitchingRow) {
                    team = pitchingRow['team']['name'];
                    team = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[team][0]}">`;
                } else {
                    team = pitchingRow['numTeams'];
                }

                if (j == 0 && splits.length > 1) {
                    seasonYear += `&nbsp; ${svgDownArrow}`;
                    dropdownRowIndices.push(rowIndex);
                }

                pitchingStatsDT.row.add([
                    `${seasonYear}`,
                    `${team}`,
                    pitchingRow['stat']['wins'],
                    pitchingRow['stat']['losses'],
                    pitchingRow['stat']['era'],
                    pitchingRow['stat']['gamesPitched'],
                    pitchingRow['stat']['gamesStarted'],
                    pitchingRow['stat']['saves'],
                    pitchingRow['stat']['inningsPitched'],
                    pitchingRow['stat']['strikeOuts'],
                    pitchingRow['stat']['whip'],
                ]);

                if (j > 0) {
                    subRowIndices.push(rowIndex);
                }

                rowIndex += 1;
            }
        }

        pitchingStatsDT.draw(true);

        $('#pitching-stats th, #pitching-stats td').off('click').on('click', function () {
            var colIndex = $(this).index();
            if (colIndex >= 2 && allYearsChecked) {
                var clickedColumn = pitchingStatsDT.column($(this).index());
                var columnData = pitchingStatsDT.column($(this).index()).data().toArray();
                var years = pitchingStatsDT.column(0).data().toArray();
                var statTitle = clickedColumn.header().querySelector('span.tooltip').getAttribute('data-tooltip');

                const seen = new Set();
                const resultIndexes = [];
                years.forEach((item, index) => {
                    const match = item.match(/\b\d{4}\b/);
                    if (match) {
                        const year = match[0];
                        if (!seen.has(year)) {
                            seen.add(year);
                            resultIndexes.push(index);
                        }
                    }
                });
                years = resultIndexes.map(index => years[index]);
                years = years.map(year => year.slice(0, 4));
                columnData = resultIndexes.map(index => columnData[index]);

                setModalData({
                    statTitle: statTitle,
                    years: years,
                    columnData: columnData
                });
                setModalOpen(true);
                $('#pitching-stats td, #pitching-stats th').removeClass('table-highlight');
            }
        });

        $('#pitching-stats th, #pitching-stats td').off('mouseenter').off('mouseleave').on('mouseenter', function () {
            if (($(this).index() >= 2)) {
                const colIndex = $(this).index();
                $('#pitching-stats tr').each(function () {
                    $(this).find('td, th').eq(colIndex).addClass('table-highlight');
                });
            }
        }).on('mouseleave', function () {
            $('#pitching-stats td, #pitching-stats th').removeClass('table-highlight');
        });

        let dropdownRows = pitchingStatsDT.rows(dropdownRowIndices).nodes();
        let subRows = pitchingStatsDT.rows(subRowIndices).nodes();

        $(dropdownRows).each(function (index, dropdownRow) {
            $(dropdownRow).on('click', function () {
                let svgArrow = $(dropdownRow).find('td:first svg');
                var direction = svgArrow.attr('data-direction');

                if (direction == 'up') {
                    svgArrow.replaceWith(svgDownArrow);
                } else {
                    svgArrow.replaceWith(svgUpArrow);
                }

                let nextRows = $(dropdownRow).nextAll('tr');
                let matchingRows = [];

                nextRows.each(function (i, nextRow) {
                    if ($(nextRow).hasClass('stats-subrow')) {
                        matchingRows.push(nextRow);
                    } else {
                        return false;
                    }
                });
                // var yearSubRows = $(dropdownRow).nextAll('tr').filter('.stats-subrow');

                $(matchingRows).each(function (i, subRow) {
                    $(subRow).toggleClass('stats-subrow-hidden');
                });
            });
        });

        $(subRows).each(function (index, subRow) {
            $(subRow).addClass('stats-subrow');
            $(subRow).addClass('stats-subrow-hidden');
        });
    }


    React.useEffect(() => {
        const playerStatsPhoto = $(document.querySelector('#player-stats-photo'));
        const playerStatsLabel = $(document.querySelector('#player-stats-label'));
        const playerDetails = $(document.querySelector('#player-details'));
        const teamColorBanners = $(document.querySelectorAll('.player-team-color-banner'));

        // const allYearsSwitchDiv = $(document.querySelector('#all-years-switch-container'));
        const allYearsSwitch = $(document.querySelector('#all-years-switch'));
        const yearSelectDiv = $(document.querySelector('#player-stats-year-select-container'));
        // const teamsSelect = document.querySelector('#player-stats-year-select');

        const pitchingStatsDiv = $(document.querySelector('#pitching-stats-container'));
        const hittingStatsDiv = $(document.querySelector('#hitting-stats-container'));
        const genericStatsDiv = $(document.querySelector('#generic-stats-container'));
        const missingStatsDiv = $(document.querySelector('#missing-stats-container'));

        // pitching charts
        const pitchesPieChartCanvas = $(document.querySelector('#pitches-pie-chart canvas'));
        var pitchesPieChart = Chart.getChart(pitchesPieChartCanvas);
        // var pitchesPieChart = null;

        const pitchesScatterPlotCanvas = $(document.querySelector('#pitches-scatter-plot canvas'));
        var pitchesScatterPlot = Chart.getChart(pitchesScatterPlotCanvas);
        // var pitchesScatterPlot = null;

        const strikeZonesDiv = $(document.querySelector('#strike-zones'));

        const inningsPitchedBarChartCanvas = $(document.querySelector('#innings-pitched-bar-chart canvas'));
        var inningsPitchedBarChart = Chart.getChart(inningsPitchedBarChartCanvas);
        // var inningsPitchedBarChart = null;

        // hitting charts
        const hitsScatterPlotCanvas = $(document.querySelector('#hits-scatter-plot canvas'));
        var hitsScatterPlot = Chart.getChart(hitsScatterPlotCanvas);
        // var hitsScatterPlot = null;

        // generic charts
        const activeStatusTimePlotCanvas = $(document.querySelector('#active-status-time-plot canvas'));
        var activeStatusTimePlot = Chart.getChart(activeStatusTimePlotCanvas);
        // var activeStatusTimePlot = null;

        var pitchingStatsTable = document.querySelector('#pitching-stats');
        var pitchingGameLogTable = document.querySelector('#pitching-game-log');

        if ($.fn.dataTable.isDataTable(pitchingStatsTable)) {
            pitchingStatsDT = $(pitchingStatsTable).DataTable();
        } else {
            pitchingStatsDT = $(pitchingStatsTable).DataTable({
                // select: true,
                pageLength: 50,
                dom: 't',
                columnDefs: [],
                ordering: false,
                buttons: [],
                scrollCollapse: true
            });
        }

        if ($.fn.dataTable.isDataTable(pitchingGameLogTable)) {
            pitchingGameLogDT = $(pitchingGameLogTable).DataTable();
        } else {
            pitchingGameLogDT = $(pitchingGameLogTable).DataTable({
                select: {
                    info: false
                },
                paging: true,
                dom: 'tip',
                columnDefs: [],
                ordering: false,
                buttons: [],
                scrollCollapse: true,
                columnDefs: [
                    { targets: 10, visible: false }
                ]
            });
        }

        var hittingStatsTable = document.querySelector('#hitting-stats');
        if ($.fn.dataTable.isDataTable(hittingStatsTable)) {
            var hittingStatsDT = $(hittingStatsTable).DataTable();
        } else {
            var hittingStatsDT = $(hittingStatsTable).DataTable({
                // select: true,
                pageLength: 50,
                dom: 't',
                columnDefs: [],
                ordering: false,
                buttons: [],
                scrollCollapse: true
            });
        }

        var gameDataToSend;
        const detailsButton = $(document.querySelector('#details-button'));
        const xButton = $(document.querySelector('#x-button'));
        const gameLogSummary = $(document.querySelector('#game-log-summary'));
        const gameLogDetails = $(document.querySelector('#game-log-details'));

        const playerAwards = $(document.querySelector('#player-awards-div'));
        if (awardsContainerRef.current && !awardsRef.current) {
            awardsRef.current = ReactDOM.createRoot(awardsContainerRef.current);
        }

        const startYear = 2015;

        function hideAllStats() {
            playerStatsPhoto.html('');
            playerStatsLabel.html('');

            playerDetails.hide();
            playerDetails.find('li:nth-child(1) span:nth-child(2)').html('');
            playerDetails.find('li:nth-child(2) span:nth-child(2)').html('');
            playerDetails.find('li:nth-child(3) span:nth-child(2)').html('');
            playerDetails.find('li:nth-child(4) span:nth-child(2)').html('');

            teamColorBanners.css('background-color', 'transparent');

            pitchingStatsDiv.hide();
            hittingStatsDiv.hide();
            genericStatsDiv.hide();
            missingStatsDiv.hide();

            gameLogSummary.html('');
            gameLogDetails.html('<br><br><br><br>');
            // awardsRef.current.render(
            //     <>
            //         <br /><br /><br /><br />
            //     </>
            // );
        }

        hideAllStats();

        // playerID = e.detail.playerID;
        // teamColor = e.detail.color;

        // playerID = 519242;
        // teamColor = '#55FFAA';

        playerID = selectedPlayer.playerID;
        teamColor = selectedPlayer.color;

        allYearsSwitch.hide();
        // allYearsSwitchDiv.html('');
        yearSelectDiv.html('');

        function destroyCharts() {
            var charts = [
                pitchesPieChart,
                pitchesScatterPlot,
                inningsPitchedBarChart,
                hitsScatterPlot,
                activeStatusTimePlot];

            charts.forEach(chart => {
                if (chart) {
                    try {
                        chart.destroy();
                    } catch (error) {
                        console.error("Failed to destroy chart:", error);
                    }
                }
            });
        }
        destroyCharts();

        strikeZonesDiv.html('');

        if (playerID == null) {
            // console.log('hiding');
            // hideAllStats();
        } else {
            teamColorBanners.eq(0).css('background-color', teamColor[0]);
            teamColorBanners.eq(1).css('background-color', teamColor[1]);

            //     allYearsSwitchDiv.html(`
            // <label class="switch-light switch-ios" onclick="">
            //     <input id="all-years" type="checkbox">
            //     <strong>All years</strong>
            //     <span>
            //         <span>No</span>
            //         <span>Yes</span>
            //         <a></a>
            //     </span>
            // </label>
            // `);
            allYearsSwitch.show();

            yearSelectDiv.html('<select id="player-stats-year-select"></select>');
            var yearSelect = yearSelectDiv.find('select').get(0);

            var newStylesheet = $('<link>', {
                rel: 'stylesheet',
                href: 'https://unpkg.com/slim-select@latest/dist/slimselect.css'
            });

            $('head').append(newStylesheet);

            var yearDropdown = new SlimSelect({
                select: yearSelect,
                settings: {
                    showSearch: false,
                    placeholderText: 'Year',
                    closeOnSelect: true,
                    allowDeselect: false,
                },
                events: {
                    afterChange: (newVal, oldVal) => {
                        destroyCharts();
                        var newYear = yearDropdown.getSelected()[0];
                        setSelectedYear(newYear);
                        createPitchingCharts(newYear);
                        createGenericCharts(newYear);
                    }
                }
            });

            var statsURLs = [];
            const baseYear = 2025;
            for (let i = baseYear; i >= startYear; i--) {
                // console.log(gameLog[i]['stat']['summary']);
                statsURLs.push(`https://statsapi.mlb.com/api/v1/people/${playerID}?hydrate=stats(group=[hitting,pitching],type=[season,seasonAdvanced,career,careerAdvanced],season=${i})`);
            }
            // console.log('statURLs');
            // console.log(statsURLs);

            var promises = statsURLs.map(url =>
                fetch(url)
                    .then(response => {
                        return response.json();
                    })
                    .catch(error => console.error('Error fetching data:', error))
            );

            Promise.all(promises)
                .then(splitData => {
                    var combinedData = splitData.flat();

                    var seasonPitching;
                    var seasonPitchingForAllYears;
                    var careerPitching;
                    // var seasonHittingForAllYears;
                    // var careerHitting;

                    playerStats = combinedData[0];

                    // playerStats = await fetch(`https://statsapi.mlb.com/api/v1/people/${playerID}?hydrate=stats(group=[hitting,pitching],type=[season,seasonAdvanced,career,careerAdvanced],season=${year})`);
                    // playerStats = await playerStats.json();
                    playerStats = playerStats['people'][0];

                    playerStatsPhoto.html(`<img src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${playerID}/headshot/silo/current">`);

                    var playerName = `${playerStats['fullName']}`;
                    var playerNumber = '';
                    if ('primaryNumber' in playerStats) {
                        playerNumber = `&bull; #${playerStats['primaryNumber']}`;
                    }
                    playerName = `${playerStats['fullName']} ${playerNumber} &bull; <a href="https://www.mlb.com/player/${fixName(playerStats['fullName'])}-${playerID}" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF" style="vertical-align: middle; margin-bottom: 5px;"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/></svg></a>`;
                    playerStatsLabel.html(playerName);

                    playerDetails.find('li:nth-child(1) span:nth-child(2)').html(playerStats['currentAge']);
                    playerDetails.find('li:nth-child(2) span:nth-child(2)').html(playerStats['primaryPosition']['abbreviation']);

                    var debutDate = '---';
                    if (playerStats['mlbDebutDate'] != undefined) {
                        debutDate = formatDate(playerStats['mlbDebutDate']);
                    }
                    playerDetails.find('li:nth-child(3) span:nth-child(2)').html(debutDate);

                    if ('birthStateProvince' in playerStats) {
                        playerDetails.find('li:nth-child(4) span:nth-child(2)').html(`${playerStats['birthCity']}, ${playerStats['birthStateProvince']}`);
                    } else {
                        playerDetails.find('li:nth-child(4) span:nth-child(2)').html(`${playerStats['birthCity']}, ${playerStats['birthCountry']}`);
                    }

                    playerDetails.show();

                    var position = playerStats['primaryPosition']['name'];
                    setPlayerPosition(position);

                    console.log('playerStats');
                    console.log(playerStats);

                    var stats = playerStats['stats'];

                    if (stats === undefined) {
                        missingStatsDiv.show();
                    } else {
                        if (position == 'Pitcher') {
                            var seasonPitching = stats.find(item =>
                                item.type.displayName === 'season' &&
                                item.group.displayName === 'pitching'
                            );
                            var seasonAdvancedPitching = stats.find(item =>
                                item.type.displayName === 'seasonAdvanced' &&
                                item.group.displayName === 'pitching'
                            );
                            var careerPitching = stats.find(item =>
                                item.type.displayName === 'career' &&
                                item.group.displayName === 'pitching'
                            );
                            var careerAdvancedPitching = stats.find(item =>
                                item.type.displayName === 'careerAdvanced' &&
                                item.group.displayName === 'pitching'
                            );

                            // console.log('pitching');
                            // console.log(seasonPitching);
                            // console.log(seasonAdvancedPitching);
                            // console.log(careerPitching);
                            // console.log(careerAdvancedPitching);

                            var validYears = [];

                            // get seasonPitching for all years
                            var seasonPitchingForAllYears = [];
                            for (let i = 0; i < combinedData.length; i++) {
                                var playerStatsForYear = combinedData[i];
                                // console.log(playerStatsForYear);
                                playerStatsForYear = playerStatsForYear['people'][0];

                                var statsForYear = playerStatsForYear['stats'];
                                var seasonPitchingForYear = statsForYear.find(item =>
                                    item.type.displayName === 'season' &&
                                    item.group.displayName === 'pitching'
                                );

                                if (seasonPitchingForYear != undefined) {
                                    seasonPitchingForAllYears.push(seasonPitchingForYear);

                                    validYears.push(seasonPitchingForYear['splits'][0]['season']);
                                }
                            }
                            setSeasonPitching(seasonPitching);
                            setSeasonPitchingForAllYears(seasonPitchingForAllYears);
                            setCareerPitching(careerPitching);

                            yearDropdown.setData(
                                validYears.map(year => ({
                                    text: year,
                                    value: year
                                }))
                            );

                            updatePitchingStatsTable(seasonPitching !== undefined
                                ? [seasonPitching, careerPitching]
                                : [careerPitching]);

                            pitchingStatsDiv.show();
                            hittingStatsDiv.hide();
                        } else {
                            var seasonHitting = stats.find(item =>
                                item.type.displayName === 'season' &&
                                item.group.displayName === 'hitting'
                            );
                            var seasonAdvancedHitting = stats.find(item =>
                                item.type.displayName === 'seasonAdvanced' &&
                                item.group.displayName === 'hitting'
                            );
                            var careerHitting = stats.find(item =>
                                item.type.displayName === 'career' &&
                                item.group.displayName === 'hitting'
                            );
                            var careerAdvancedHitting = stats.find(item =>
                                item.type.displayName === 'careerAdvanced' &&
                                item.group.displayName === 'hitting'
                            );

                            console.log('hitting');
                            console.log(seasonHitting);
                            console.log(seasonAdvancedHitting);
                            console.log(careerHitting);
                            console.log(careerAdvancedHitting);

                            hittingStatsDT.clear();

                            seasonHitting = seasonHitting['splits'][0];
                            careerHitting = careerHitting['splits'][0];

                            hittingStatsDT.row.add([
                                // `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[seasonHitting['team']['name']][0]}"><span>${seasonHitting['season']}</span>`,
                                `${seasonHitting['season']}`,
                                seasonHitting['stat']['atBats'],
                                seasonHitting['stat']['runs'],
                                seasonHitting['stat']['hits'],
                                seasonHitting['stat']['homeRuns'],
                                seasonHitting['stat']['rbi'],
                                seasonHitting['stat']['stolenBases'],
                                seasonHitting['stat']['avg'],
                                seasonHitting['stat']['obp'],
                                seasonHitting['stat']['slg'],
                                seasonHitting['stat']['ops']
                            ]);

                            hittingStatsDT.row.add([
                                'Career',
                                careerHitting['stat']['atBats'],
                                careerHitting['stat']['runs'],
                                careerHitting['stat']['hits'],
                                careerHitting['stat']['homeRuns'],
                                careerHitting['stat']['rbi'],
                                careerHitting['stat']['stolenBases'],
                                careerHitting['stat']['avg'],
                                careerHitting['stat']['obp'],
                                careerHitting['stat']['slg'],
                                careerHitting['stat']['ops']
                            ]); //: TODO: do this for hitting also

                            // createHitsScatterPlot();

                            hittingStatsDT.draw(true);

                            pitchingStatsDiv.hide();
                            hittingStatsDiv.show();
                        }

                        genericStatsDiv.show();
                        missingStatsDiv.hide();
                    }

                })
        }

        function createPitchingCharts(year) {
            fetch(`https://statsapi.mlb.com/api/v1/people/${playerID}?&hydrate=stats(group=[pitching],type=[pitchArsenal,gameLog,metricAverage],metrics=[releaseSpeed],limit=10000,season=${year})`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    var gameLog = data['people'][0]['stats'][1]['splits'];
                    var gameURLs = [];

                    console.log('gameLog');
                    console.log(gameLog);

                    pitchingGameLogDT.clear();
                    for (let i = 0; i < gameLog.length; i++) {
                        var date = gameLog[i]['date'];
                        var team = gameLog[i]['team']['name'];
                        var opponent = gameLog[i]['opponent']['name'];
                        var summary = gameLog[i]['stat']['summary'];
                        var pitches = gameLog[i]['stat']['numberOfPitches'];
                        var inningsPitched = gameLog[i]['stat']['inningsPitched'];
                        var er = gameLog[i]['stat']['earnedRuns'];
                        var era = gameLog[i]['stat']['era'];
                        var hits = gameLog[i]['stat']['hits'];
                        var strikeouts = gameLog[i]['stat']['strikeOuts'];
                        var walks = gameLog[i]['stat']['baseOnBalls'];
                        var whip = gameLog[i]['stat']['whip'];
                        var link = gameLog[i]['game']['link'];

                        date = `${date.split('-')[1]}/${date.split('-')[2]}`;

                        var teamWins = gameLog[i]['isWin'] ? 'winner' : '';
                        var opponentWins = gameLog[i]['isWin'] ? '' : 'winner';
                        team = `<img width="30" height="30" class="logo ${teamWins}" src="${Consts.teamsDetails[team][0]}">`;
                        opponent = `<img width="30" height="30" class="logo ${opponentWins}" src="${Consts.teamsDetails[opponent][0]}">`;
                        var vsOrAt = gameLog[i]['isHome'] ? '&nbsp;vs.&nbsp;' : '&nbsp;@&nbsp;&nbsp;';
                        var matchup = `${team}${vsOrAt}${opponent}`;

                        console.log(gameLog[i]);
                        pitchingGameLogDT.row.add([
                            date,
                            matchup,
                            pitches,
                            inningsPitched,
                            er,
                            era,
                            hits,
                            strikeouts,
                            walks,
                            whip,
                            link
                        ]);

                        pitchingGameLogDT.draw(true);

                        gameURLs.push(`https://statsapi.mlb.com/${gameLog[i]['game']['link']}`);
                    }

                    pitchingGameLogDT.on('select', function (e, dt, type, indexes) {
                        var selectedIndex = indexes[0];
                        var gameLink = dt.row(selectedIndex).data()[10];

                        var link = `https://statsapi.mlb.com/${gameLink}`;
                        fetch(link)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok');
                                }
                                return response.json();
                            })
                            .then(gameResponse => {
                                gameDataToSend = gameResponse;
                                console.log(gameDataToSend);
                                setSelectedGame(gameDataToSend);
                                navigate('/games');
                            })
                    });

                    var promises = gameURLs.map(url =>
                        fetch(url)
                            .then(response => {
                                return response.json();
                            })
                            .catch(error => console.error('Error fetching data:', error))
                    );

                    Promise.all(promises)
                        .then(splitData => {
                            var combinedData = splitData.flat();

                            // bar chart
                            var allPlaysPitched = [];

                            // get all pitches from that pitcher
                            var allPitches = [];
                            for (let i = 0; i < combinedData.length; i++) {
                                var allPlays = combinedData[i]['liveData']['plays']['allPlays'];
                                for (let j = 0; j < allPlays.length; j++) {
                                    if (allPlays[j]['matchup']['pitcher']['id'] == playerID) {
                                        var playEvents = allPlays[j]['playEvents'];
                                        for (let k = 0; k < playEvents.length; k++) {
                                            if (playEvents[k]['isPitch']) {
                                                allPitches.push(playEvents[k]);
                                            }
                                        }

                                        allPlaysPitched.push(allPlays[j]);
                                    }
                                }
                            }
                            console.log(`allPitches: ${allPitches.length}`);

                            // pie chart
                            var counts = [];
                            var pitches = [];
                            var pitchCodes = [];

                            // scatter plot
                            var pitchDatasets = [];
                            var labels = [];

                            for (let i = 0; i < allPitches.length; i++) {
                                var pitchCode = null;
                                var pitchDescription = null;
                                try {
                                    pitchCode = allPitches[i]['details']['type']['code'];
                                    pitchDescription = allPitches[i]['details']['type']['description'];

                                    // console.log(pitchType);
                                    // if (pitchCode == 'FA') {
                                    //   pitchCode = 'FF';
                                    // }
                                    // if (pitchDescription == 'Fastball') {
                                    //   pitchDescription = 'Four-Seam Fastball';
                                    // }
                                    if (pitchCode != 'FA') {
                                        var dataPoint = {
                                            x: allPitches[i]['pitchData']['startSpeed'],
                                            y: 0.1 + (0.9 - 0.1) * Math.random()
                                        };
                                    }
                                } catch {
                                    // console.log('unknown pitch');
                                    // console.log(allPitches[i]);
                                    pitchCode = '?';
                                    pitchDescription = 'Unknown';
                                }
                                // console.log(allPitches[i]['details']);

                                if (pitchDescription != 'Unknown') {
                                    if (!(pitchDatasets.find(item => item.label == pitchDescription))) {
                                        // pie chart
                                        counts.push(1);
                                        pitches.push(pitchDescription);
                                        pitchCodes.push(pitchCode);

                                        // console.log(pitchDescription);
                                        // scatter plot
                                        pitchDatasets.push({
                                            data: [dataPoint],
                                            label: pitchDescription,
                                            pointBackgroundColor: pitchColors(pitchCode),
                                            pointBorderColor: 'rgba(0, 0, 0, 1)',
                                            pointRadius: 4,
                                            borderWidth: 1
                                        });
                                    } else {
                                        // pie chart
                                        var pitchIndex = pitchCodes.indexOf(pitchCode);
                                        counts[pitchIndex] += 1;

                                        // scatter plot
                                        var pitchDataset = pitchDatasets.find(item => item.label == pitchDescription);
                                        pitchDataset['data'].push(dataPoint);
                                    }
                                }
                            }

                            // pie chart
                            var combinedPitches = counts.map((counts, index) => ({
                                counts: counts,
                                pitches: pitches[index],
                                pitchCodes: pitchCodes[index]
                            }));

                            combinedPitches.sort((a, b) => b.counts - a.counts);
                            var sortedCounts = combinedPitches.map(item => item.counts);
                            var sortedPitches = combinedPitches.map(item => item.pitches);
                            var sortedPitchCodes = combinedPitches.map(item => item.pitchCodes);

                            // scatter plot
                            pitchDatasets.sort((a, b) => b.data.length - a.data.length);
                            for (let i = 0; i < pitchDatasets.length; i++) {
                                labels.push(pitchDatasets[i]['label']);
                            }

                            // var total = 0;
                            // for (let i = 0; i < pitchDatasets.length; i++) {
                            //     total += pitchDatasets[i]['data'].length;
                            // }

                            // bar chart
                            // console.log('allPlaysPitched');
                            // console.log(allPlaysPitched);
                            var inningsPitched = {};
                            for (let i = 1; i <= 9; i++) {
                                inningsPitched[i] = 0;
                            }
                            var newOuts = 0;
                            var currInning;
                            for (let i = 0; i < allPlaysPitched.length; i++) {
                                // console.log(allPlaysPitched[i]['about']['inning'], allPlaysPitched[i]['about']['hasOut'], allPlaysPitched[i]['count']['outs'], allPlaysPitched[i]);

                                currInning = allPlaysPitched[i]['about']['inning'];
                                newOuts = 0;

                                for (let j = 0; j < allPlaysPitched[i]['runners'].length; j++) {
                                    if (allPlaysPitched[i]['runners'][j]['movement']['isOut']) {
                                        newOuts += 1;
                                    }
                                }

                                if (newOuts > 0) {
                                    if (!(currInning in inningsPitched)) {
                                        inningsPitched[currInning] = newOuts;
                                    } else {
                                        inningsPitched[currInning] += newOuts;
                                        // console.log(`ip[${currInning}] = ${inningsPitched[currInning]}`);
                                    }
                                    // console.log(`adding: ${newOuts} outs`);
                                }
                            }

                            Object.keys(inningsPitched).forEach(inningNumber => {
                                inningsPitched[inningNumber] /= 3;
                            });

                            var totalIP = Object.values(inningsPitched).reduce((a, b) => a + b, 0);
                            totalIP = formatInnings(totalIP);

                            var backgroundColors = sortedPitchCodes.map(pitchColors);

                            pitchesPieChart = new Chart(pitchesPieChartCanvas, {
                                type: 'pie',
                                data: {
                                    labels: sortedPitches,
                                    datasets: [{
                                        data: sortedCounts,
                                        backgroundColor: backgroundColors
                                    }]
                                },
                                options: {
                                    layout: {
                                        padding: {
                                            bottom: 20
                                        }
                                    },
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Pitch Types',
                                            color: 'white',
                                            font: {
                                                size: 21
                                            }
                                        },
                                        legend: {
                                            labels: {
                                                color: 'white',
                                                font: {
                                                    size: 18
                                                }
                                            },
                                        }
                                    }
                                }
                            });

                            pitchesScatterPlot = new Chart(pitchesScatterPlotCanvas, {
                                type: 'scatter',
                                data: {
                                    labels: labels,
                                    datasets: pitchDatasets
                                },
                                options: {
                                    scales: {
                                        x: {
                                            min: 75,
                                            max: 100,
                                            border: {
                                                display: false
                                            },
                                            ticks: {
                                                color: 'white',
                                                font: {
                                                    size: 18
                                                }
                                            },
                                            grid: {
                                                color: 'white',
                                                z: 1
                                            }
                                        },
                                        y: {
                                            min: 0,
                                            max: 1,
                                            ticks: {
                                                display: false,
                                                stepSize: 1,
                                            },
                                            grid: {
                                                display: true,
                                                drawTicks: false,
                                                color: 'white'
                                            }
                                        }
                                    },
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'All Pitches (mph)',
                                            color: 'white',
                                            font: {
                                                size: 21
                                            }
                                        },
                                        legend: {
                                            display: true,
                                            labels: {
                                                color: 'white',
                                                font: {
                                                    size: 18
                                                },
                                                generateLabels: chart => chart.data.labels.map((l, i) => ({
                                                    datasetIndex: i,
                                                    text: l,
                                                    fillStyle: chart.data.datasets[i].pointBackgroundColor,
                                                    fontColor: 'white',
                                                    strokeStyle: 'white',
                                                    lineWidth: 2,
                                                    hidden: chart.getDatasetMeta(i).hidden
                                                }))
                                            }
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function (context) {
                                                    var label = context.dataset.label;
                                                    var speed = context.parsed.x;
                                                    return `${label}, ${speed} mph`;
                                                }
                                            }
                                        }
                                    }
                                }
                            });

                            inningsPitchedBarChart = new Chart(inningsPitchedBarChartCanvas, {
                                type: 'bar',
                                data: {
                                    labels: Object.keys(inningsPitched),
                                    datasets: [
                                        {
                                            data: Object.values(inningsPitched),
                                            backgroundColor: 'rgba(55, 160, 235, 1)',
                                            borderColor: 'white',
                                            borderWidth: 2,
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
                                        x: {
                                            title: {
                                                display: true,
                                                text: 'Inning Number',
                                                color: 'white',
                                                font: {
                                                    size: 18
                                                }
                                            },
                                            ticks: {
                                                display: true,
                                                color: 'white',
                                                font: {
                                                    size: 18
                                                },
                                            },
                                            grid: {
                                                display: false
                                            }
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Innings Pitched',
                                                color: 'white',
                                                font: {
                                                    size: 18
                                                }
                                            },
                                            border: {
                                                display: false
                                            },
                                            ticks: {
                                                display: true,
                                                color: 'white',
                                                font: {
                                                    size: 18
                                                }
                                            },
                                            grid: {
                                                color: 'white'
                                            }
                                        }
                                    },
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: `Innings Pitched Distribution (Total: ${totalIP})`,
                                            color: 'white',
                                            font: {
                                                size: 21
                                            }
                                        },
                                        legend: {
                                            display: false
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function (context) {
                                                    return formatInnings(context.parsed.y);
                                                }
                                            },
                                            mode: 'index',
                                            intersect: false
                                        },
                                        hover: {
                                            mode: 'index',
                                            intersect: false
                                        }
                                    }
                                }
                            });

                            fillStrikeZones(allPitches, sortedPitches);
                        })
                })
        }

        function createHittingCharts(year) {
            fetch(`https://statsapi.mlb.com/api/v1/people/${playerID}?&hydrate=stats(group=[hitting],type=[season,seasonAdvanced,gameLog,sprayChart],season=${year})`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {

                    var gameLog = data['people'][0]['stats'][2]['splits'];
                    var gameURLs = [];

                    for (let i = 0; i < gameLog.length; i++) {
                        // console.log(gameLog[i]['stat']['summary']);
                        gameURLs.push(`https://statsapi.mlb.com${gameLog[i]['game']['link']}`);
                    }
                    // console.log(gameURLs);

                    var promises = gameURLs.map(url =>
                        fetch(url)
                            .then(response => {
                                return response.json();
                            })
                            .catch(error => console.error('Error fetching data:', error))
                    );

                    Promise.all(promises)
                        .then(splitData => {
                            fetch(`https://statsapi.mlb.com/api/v1/eventTypes`)
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Network response was not ok');
                                    }
                                    return response.json();
                                })
                                .then(eventTypes => {
                                    // console.log('eventTypes');
                                    // console.log(eventTypes);

                                    var combinedData = splitData.flat();

                                    console.log('allHits');
                                    var allHits = [];
                                    var allLastPlayEvents = [];
                                    for (let i = 0; i < combinedData.length; i++) {
                                        // console.log(combinedData[i]['gamePk']);
                                        var allPlays = combinedData[i]['liveData']['plays']['allPlays'];
                                        for (let j = 0; j < allPlays.length; j++) {
                                            if (allPlays[j]['matchup']['batter']['id'] == playerID && allPlays[j]['about']['isComplete']) {
                                                var playEvents = allPlays[j]['playEvents'];
                                                var lastPlayEvent = playEvents[playEvents.length - 1];


                                                if ('hitData' in lastPlayEvent) {
                                                    allHits.push(allPlays[j]);
                                                    allLastPlayEvents.push(lastPlayEvent);
                                                }

                                                // console.log(lastPlayEvent['details']['description']);
                                            }
                                        }
                                    }

                                    console.log(allHits.length);
                                    console.log(allLastPlayEvents.length);

                                    var allHitTypes = [];
                                    var allHitLocations = [];
                                    var hitDatasets = [];

                                    for (let i = 0; i < allHits.length; i++) {
                                        // if (allHits[i]['result']['event'] == 'Home Run') {

                                        var event = allHits[i]['result']['event'];
                                        var hitCoords = {
                                            x: allLastPlayEvents[i]['hitData']['coordinates']['coordX'],
                                            y: 250 - allLastPlayEvents[i]['hitData']['coordinates']['coordY']
                                        };

                                        allHitTypes.push(event);
                                        allHitLocations.push(hitCoords);


                                        if (!hitDatasets.find(item => item.label == event)) {
                                            hitDatasets.push({
                                                data: [hitCoords],
                                                label: event,
                                                pointBackgroundColor: hitColors(event),
                                                pointBorderColor: 'rgba(0, 0, 0, 1)',
                                                pointRadius: 4,
                                                borderWidth: 2
                                            });
                                        } else {
                                            var hitDataset = hitDatasets.find(item => item.label == event);
                                            hitDataset['data'].push(hitCoords);
                                        }

                                        // eventTypes

                                        console.log([allLastPlayEvents[i]['hitData']['coordinates']['coordX'], allLastPlayEvents[i]['hitData']['coordinates']['coordY'], event]);
                                        // }
                                    }

                                    // flip y axis
                                    // add links add locations of hits
                                    // change background to gray
                                    // divs for team colors

                                    console.log('----');
                                    console.log(allHitLocations);
                                    console.log(allHits);
                                    console.log(allHitTypes);
                                    console.log(allHitLocations);
                                    console.log(hitDatasets);

                                    // var labels = [];

                                    // for (let i = 0; i < hitDatasets.length; i++) {
                                    //     labels.push(hitDatasets[i]['label']);
                                    // }


                                    // hitDatasets.push({
                                    //     data: allHitLocations,
                                    //     label: 'label',
                                    //     pointBackgroundColor: 'rgb(200, 0, 0, 1)',
                                    //     pointBorderColor: 'rgb(0, 0, 0, 1)',
                                    //     pointRadius: 4,
                                    //     borderWidth: 1
                                    // });

                                    // var hitLabels = [];
                                    // var hitDatasets = [];
                                    // var backgroundColors = [
                                    //     'rgb(50, 100, 200)',
                                    //     'rgb(200, 50, 200)',
                                    //     'rgb(50, 200, 100)',
                                    //     'rgb(200, 0, 50)'
                                    // ];

                                    // for (let i = 0; i < 4; i++) {
                                    //     hitLabels.push(`${i}`);

                                    //     hitDatasets.push({
                                    //         data: [
                                    //             {
                                    //                 x: 200 * Math.random(),
                                    //                 y: 200 * Math.random()
                                    //             },
                                    //             {
                                    //                 x: 200 * Math.random(),
                                    //                 y: 200 * Math.random()
                                    //             },
                                    //             {
                                    //                 x: 200 * Math.random(),
                                    //                 y: 200 * Math.random()
                                    //             }
                                    //         ],
                                    //         label: `${i}`,
                                    //         pointBackgroundColor: backgroundColors[i],
                                    //         pointBorderColor: 'rgb(0, 0, 0, 1)',
                                    //         pointRadius: 5,
                                    //         borderWidth: 0.5
                                    //     });
                                    // }

                                    // console.log('hits');
                                    // console.log(hitLabels);
                                    console.log(hitDatasets);

                                    hitsScatterPlot = new Chart(hitsScatterPlotCanvas, {
                                        type: 'scatter',
                                        data: {
                                            // datasets: [{
                                            //   pointRadius: 4,
                                            //   pointBackgroundColor: pitchColors,
                                            //   // label: pitchLabels,
                                            //   data: speeds
                                            // }]
                                            // labels: hitLabels,
                                            // labels: 'labels',
                                            datasets: hitDatasets
                                        },
                                        plugins: [{
                                            beforeDraw: chart => {
                                                var ctx = chart.ctx;
                                                ctx.save();
                                                const image = new Image();
                                                // image.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Stack_Overflow_logo.svg/2560px-Stack_Overflow_logo.svg.png';
                                                image.src = Consts.fieldBackground;
                                                //   image.src = 'baseball-field.png';
                                                ctx.drawImage(image, chart.chartArea.left, chart.chartArea.top, chart.chartArea.width, chart.chartArea.height);
                                                ctx.restore();
                                            }
                                        }],
                                        options: {
                                            aspectRatio: 1,
                                            scales: {
                                                x: {
                                                    min: 0,
                                                    max: 250,
                                                    ticks: {
                                                        color: 'white'
                                                    },
                                                    grid: {
                                                        display: false
                                                    }
                                                },
                                                y: {
                                                    min: 0,
                                                    max: 250,
                                                    ticks: {
                                                        color: 'white',
                                                        // reverse: true
                                                    },
                                                    grid: {
                                                        display: false
                                                    }
                                                },
                                            },
                                            plugins: {
                                                legend: {
                                                    display: true,
                                                    labels: {
                                                        color: 'white',
                                                        font: {
                                                            size: 18
                                                        },
                                                        // usePointStyle: true,
                                                        generateLabels: chart => chart.data.labels.map((l, i) => ({
                                                            // generateLabels: chart => chart.data.datasets.labels.slice(0, 2).map((l, i) => ({
                                                            datasetIndex: i,
                                                            text: l,
                                                            // fillStyle: chart.data.datasets[i].backgroundColor,
                                                            fillStyle: chart.data.datasets[i].pointBackgroundColor,
                                                            fontColor: 'white',
                                                            // strokeStyle: chart.data.datasets[i].backgroundColor,
                                                            strokeStyle: 'white',
                                                            lineWidth: 2,
                                                            hidden: chart.getDatasetMeta(i).hidden
                                                        }))
                                                    }
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'All hits',
                                                    color: 'white',
                                                    font: {
                                                        size: 21
                                                    }
                                                },
                                                // legend: {
                                                //     labels: {
                                                //         color: 'white',
                                                //         font: {
                                                //             size: 18
                                                //         }
                                                //     },
                                                // }
                                                // tooltip: {
                                                //   callbacks: {
                                                //     label: function (context) {
                                                //       var label = context.dataset.label;
                                                //       var speed = context.parsed.x;
                                                //       return `${label}, ${speed} mph`;
                                                //     }
                                                //   }
                                                // }
                                            }
                                        }
                                    });

                                    console.log(hitsScatterPlot);
                                })
                        })
                })
        }

        function createGenericCharts(year) {
            fetch(`https://statsapi.mlb.com/api/v1/seasons/${year}?sportId=1`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(seasonInfo => {
                    var seasonEndDate = seasonInfo['seasons'][0]['regularSeasonEndDate'];
                    seasonEndDate = new Date(`${seasonEndDate}T00:00:00`);

                    fetch(`https://statsapi.mlb.com/api/v1/people/${playerID}?appContext=majorLeague&hydrate=team,currentTeam,rosterEntries`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(playerInfo => {
                            fetch(`https://statsapi.mlb.com/api/v1/people/${playerID}?hydrate=stats(group=[hitting,pitching],type=[season,seasonAdvanced,gameLog],season=${year})`)
                                .then(response => {
                                    if (!response.ok) {
                                        throw new Error('Network response was not ok');
                                    }
                                    return response.json();
                                })
                                .then(allStats => {
                                    var seasonStatsByTeam = allStats['people'][0]['stats'][0]['splits'];
                                    // console.log('----------------------');
                                    console.log(seasonStatsByTeam);
                                    var allTeamsURLs = [];
                                    // for (let i = 0; i < seasonStatsByTeam.length; i++) {
                                    for (let i = 0; i < seasonStatsByTeam.length; i++) {
                                        if ('team' in seasonStatsByTeam[i]) {
                                            allTeamsURLs.push(`${Consts.baseURL}/teams/${seasonStatsByTeam[i]['team']['id']}`);
                                            // fetch(`${Consts.baseURL}/teams/${seasonStatsByTeam[i]['team']['id']}`)
                                            // .then(response => {
                                            //     if (!response.ok) {
                                            //         throw new Error('Network response was not ok');
                                            //     }
                                            //     return response.json();
                                            // })
                                            // .then(teamInfo => {
                                            //     console.log('team info');
                                            //     console.log(teamInfo);
                                            //     allTeams.push(teamInfo['teams'][0]['abbreviation']);
                                            // })
                                            // // allTeams.push(seasonStatsByTeam[i]['team']);
                                        }
                                    }

                                    var promises = allTeamsURLs.map(url =>
                                        fetch(url)
                                            .then(response => {
                                                return response.json();
                                            })
                                            .catch(error => console.error('Error fetching data:', error))
                                    );

                                    var allTeams = [];
                                    Promise.all(promises)
                                        .then(splitData => {
                                            var combinedData = splitData.flat();
                                            // console.log('combinedData');
                                            // console.log(combinedData);

                                            for (let i = 0; i < combinedData.length; i++) {
                                                allTeams.push({
                                                    id: combinedData[i]['teams'][0]['id'],
                                                    name: combinedData[i]['teams'][0]['name'],
                                                    abr: combinedData[i]['teams'][0]['abbreviation']
                                                });
                                            }

                                            // var teamId = playerInfo['people'][0]['currentTeam']['id'];
                                            // var teamName = playerInfo['people'][0]['currentTeam']['name'];

                                            // console.log(`${teamId}: ${teamName}`);

                                            var currDate;

                                            var dates = [];
                                            var rosterURLs = [];

                                            var dateOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
                                            for (let i = 0; i < allTeams.length; i++) {
                                                currDate = new Date(`${seasonInfo['seasons'][0]['regularSeasonStartDate']}T00:00:00`);
                                                while (currDate <= seasonEndDate) {
                                                    // console.log(currDate);

                                                    var formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(currDate);
                                                    // console.log(formattedDate);
                                                    dates.push(formattedDate);

                                                    rosterURLs.push(`https://statsapi.mlb.com/api/v1/teams/${allTeams[i]['id']}/roster?rosterType=active&season=${year}&date=${formattedDate}`);
                                                    var newDate = currDate.setDate(currDate.getDate() + 1);
                                                    currDate = new Date(newDate);
                                                }
                                            }
                                            // console.log(`rosterURLs.length: ${rosterURLs.length}`);

                                            var promises = rosterURLs.map(url =>
                                                fetch(url)
                                                    .then(response => {
                                                        return response.json();
                                                    })
                                                    .catch(error => console.error('Error fetching data:', error))
                                            );

                                            Promise.all(promises)
                                                .then(splitData => {
                                                    var combinedData = splitData.flat();

                                                    // var activeDates = [];
                                                    // var inactiveDates = [];
                                                    var activeDates = {};
                                                    var inactiveDates = {};

                                                    // console.log(`combinedData.length: ${combinedData.length}`);
                                                    var seasonLength = combinedData.length / allTeams.length;
                                                    // console.log(`seasonLength: ${seasonLength}`);

                                                    // console.log('all teams!');
                                                    // console.log(allTeams);
                                                    for (let i = 0; i < allTeams.length; i++) {
                                                        // console.log(`++ ${allTeams[i]}`);
                                                        var lastStatus = '';
                                                        var currStatus = '';
                                                        var sessionStart = dates[0];
                                                        var sessionEnd;

                                                        activeDates[allTeams[i]['abr']] = [];
                                                        inactiveDates[allTeams[i]['abr']] = [];

                                                        // console.log(activeDates);

                                                        // for (let j = 0; j < combinedData.length; j++) {
                                                        for (let j = 0; j < seasonLength; j++) {
                                                            // console.log(seasonLength * i + j);
                                                            // console.log(combinedData[seasonLength * i + j]['roster']);

                                                            var roster = combinedData[seasonLength * i + j]['roster'];
                                                            // console.log(roster);

                                                            const playerOnRoster = roster.find(rosterEntry => rosterEntry.person.id == playerID);
                                                            if (playerOnRoster) {
                                                                // console.log(`${dates[i]}: ${playerOnRoster}`);
                                                                // console.log(`${dates[i]}: active`);
                                                                // console.log(playerOnRoster);
                                                                currStatus = 'active';
                                                            } else {
                                                                // console.log(`${dates[i]}: not found`);
                                                                currStatus = 'inactive';
                                                            }

                                                            // if (currStatus != lastStatus || j == combinedData.length - 1) {
                                                            if (currStatus != lastStatus || j == seasonLength - 1) {
                                                                if (j != 0) {
                                                                    // sessionEnd = dates[i - 1];
                                                                    sessionEnd = dates[j];
                                                                    if (lastStatus == 'active') {
                                                                        activeDates[allTeams[i]['abr']].push([new Date(sessionStart), new Date(sessionEnd)]);
                                                                    } else if (lastStatus == 'inactive') {
                                                                        inactiveDates[allTeams[i]['abr']].push([new Date(sessionStart), new Date(sessionEnd)]);
                                                                    }
                                                                }

                                                                lastStatus = currStatus;
                                                                sessionStart = dates[j];
                                                            }
                                                        }
                                                    }

                                                    console.log(`year: ${year}`);
                                                    fetch(`https://statsapi.mlb.com/api/v1/people/${playerID}?hydrate=stats(group=[hitting,pitching],type=[season,seasonAdvanced,gameLog],season=${year})`)
                                                        .then(response => {
                                                            if (!response.ok) {
                                                                throw new Error('Network response was not ok');
                                                            }
                                                            return response.json();
                                                        })
                                                        .then(allStats => {
                                                            // console.log('allStats');
                                                            // console.log(allStats);
                                                            var gameLogInfo = allStats['people'][0]['stats'][2]['splits'];
                                                            // only get game log, not season info?
                                                            // console.log('gameLogInfo');
                                                            // console.log(gameLogInfo);

                                                            // TODO: use this
                                                            // if (playerPosition == 'Pitcher') {
                                                            //     var seasonPitching = stats.find(item =>
                                                            //         item.type.displayName === 'season' &&
                                                            //         item.group.displayName === 'pitching'
                                                            //     );

                                                            var datesPlayed = [];
                                                            for (let i = 0; i < gameLogInfo.length; i++) {
                                                                // datesPlayed.push(gameLogInfo[i]['date']);
                                                                // var datePlayed = new Date(gameLogInfo[i]['date']);
                                                                // console.log(gameLogInfo[i]);
                                                                // console.log(gameLogInfo[i]['date']);
                                                                var datePlayed = new Date(`${gameLogInfo[i]['date']}T00:00:00`);
                                                                var datePlayedEnd = new Date(datePlayed);
                                                                datePlayedEnd.setDate(datePlayedEnd.getDate() + 1);
                                                                datesPlayed.push([datePlayed, datePlayedEnd]);
                                                            }
                                                            // console.log('datesPlayed');
                                                            // console.log(datesPlayed);

                                                            var datasets = [
                                                                {
                                                                    label: 'Games Played',
                                                                    data: datesPlayed.map(dates => ({
                                                                        x: dates,
                                                                        y: 'Games'
                                                                    })),
                                                                    backgroundColor: 'rgba(100, 200, 200, 0.8)'
                                                                }
                                                            ];
                                                            for (let i = 0; i < allTeams.length; i++) {
                                                                datasets.push(
                                                                    {
                                                                        label: 'Inactive',
                                                                        data: inactiveDates[allTeams[i]['abr']].map(dates => ({
                                                                            x: dates,
                                                                            // y: 'Roster'
                                                                            y: allTeams[i]['abr']
                                                                        })),
                                                                        backgroundColor: 'rgba(200, 100, 100, 0.8)'
                                                                    },
                                                                );
                                                                datasets.push(
                                                                    {
                                                                        label: 'Active',
                                                                        data: activeDates[allTeams[i]['abr']].map(dates => ({
                                                                            x: dates,
                                                                            // y: 'Roster'
                                                                            y: allTeams[i]['abr']
                                                                            // y: ''/
                                                                        })),
                                                                        backgroundColor: 'rgba(100, 200, 100, 0.8)'
                                                                    },
                                                                );
                                                            }

                                                            var data = {
                                                                datasets: datasets
                                                            };

                                                            // console.log('time data');
                                                            // console.log(data);

                                                            var imagePromises = [];
                                                            for (let i = 0; i < allTeams.length; i++) {
                                                                // console.log(Consts.teamsDetails[allTeams[i]['name']][0]);
                                                                imagePromises.push(loadSVGToImage(Consts.teamsDetails[allTeams[i]['name']][0]));
                                                                // imagePromises.push(Consts.teamsDetails[allTeams[i]['name']][0]);
                                                            }

                                                            Promise.all(imagePromises).then((teamLogos) => {
                                                                activeStatusTimePlot = new Chart(activeStatusTimePlotCanvas, {
                                                                    type: 'bar',
                                                                    data: data,
                                                                    options: {
                                                                        indexAxis: 'y',
                                                                        responsive: true,
                                                                        layout: {
                                                                            padding: {
                                                                                left: 15,
                                                                                right: 30
                                                                            }
                                                                        },
                                                                        scales: {
                                                                            x: {
                                                                                min: new Date(`${seasonInfo['seasons'][0]['regularSeasonStartDate']}T00:00:00`), // TODO: use months as ticks
                                                                                max: seasonEndDate,
                                                                                border: {
                                                                                    display: false
                                                                                },
                                                                                ticks: {
                                                                                    color: 'white',
                                                                                    font: {
                                                                                        size: 18
                                                                                    }
                                                                                },
                                                                                grid: {
                                                                                    color: 'white'
                                                                                },
                                                                                type: 'time',
                                                                                time: {
                                                                                    unit: 'day'
                                                                                }
                                                                            },
                                                                            y: {
                                                                                border: {
                                                                                    display: false
                                                                                },
                                                                                ticks: {
                                                                                    color: function (context) {
                                                                                        if (context.index === 0) {
                                                                                            return 'white';
                                                                                        }
                                                                                        return 'rgba(0, 0, 0, 0)';
                                                                                    },
                                                                                    font: {
                                                                                        size: 18
                                                                                    },
                                                                                    padding: 10
                                                                                },
                                                                                grid: {
                                                                                    color: 'white'
                                                                                },
                                                                                beginAtZero: true,
                                                                                stacked: true
                                                                            }
                                                                        },
                                                                        plugins: {
                                                                            title: {
                                                                                display: true,
                                                                                text: 'Active Status',
                                                                                color: 'white',
                                                                                font: {
                                                                                    size: 21
                                                                                }
                                                                            },
                                                                            legend: {
                                                                                display: true,
                                                                                labels: {
                                                                                    color: 'white',
                                                                                    font: {
                                                                                        size: 18
                                                                                    },
                                                                                    generateLabels: function (chart) {
                                                                                        const datasets = chart.data.datasets;
                                                                                        return datasets.map(function (dataset, i) {
                                                                                            return {
                                                                                                datasetIndex: i,
                                                                                                text: dataset.label,
                                                                                                fillStyle: chart.data.datasets[i].backgroundColor,
                                                                                                fontColor: 'white',
                                                                                                strokeStyle: 'white',
                                                                                                lineWidth: 2,
                                                                                                hidden: chart.getDatasetMeta(i).hidden
                                                                                            };
                                                                                        });
                                                                                    }
                                                                                    // generateLabels: chart => chart.data.labels.map((l, i) => ({
                                                                                    //     datasetIndex: i,
                                                                                    //     text: l,
                                                                                    //     fillStyle: chart.data.datasets[i].backgroundColor,
                                                                                    //     fontColor: 'white',
                                                                                    //     strokeStyle: 'white',
                                                                                    //     lineWidth: 2,
                                                                                    //     hidden: chart.getDatasetMeta(i).hidden
                                                                                    // })) // TODO
                                                                                }
                                                                            },
                                                                            tooltip: {
                                                                                callbacks: {
                                                                                    title: function (context) {
                                                                                        var label = context[0]['dataset']['label'];
                                                                                        return label;
                                                                                    },
                                                                                    label: function (context) {
                                                                                        var dates = context['dataset']['data'][context['dataIndex']]['x'];
                                                                                        var startDate = new Date(dates[0]);
                                                                                        var endDate = new Date(dates[1]);

                                                                                        dateOptions = { month: '2-digit', day: '2-digit', year: 'numeric' };
                                                                                        var formattedStartDate = new Intl.DateTimeFormat('en-US', dateOptions).format(startDate);
                                                                                        var formattedEndDate = new Intl.DateTimeFormat('en-US', dateOptions).format(endDate);

                                                                                        if (context['label'] == 'Games') {
                                                                                            var gameDetails = gameLogInfo.find(game => game.date == new Intl.DateTimeFormat('en-CA', dateOptions).format(startDate));
                                                                                            updateGameLogSummary(playerID, gameDetails, formattedStartDate);
                                                                                            return formattedStartDate;
                                                                                        } else {
                                                                                            return `${formattedStartDate} - ${formattedEndDate}`;
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    },
                                                                    plugins: [
                                                                        {
                                                                            afterDraw: (chart) => {
                                                                                const { ctx, scales: { y } } = chart;
                                                                                const yTickCount = chart.data.labels.length;

                                                                                for (let i = 1; i < yTickCount; i++) {
                                                                                    const yPosition = y.getPixelForTick(i);
                                                                                    const xOffset = 40;
                                                                                    ctx.drawImage(teamLogos[i - 1], xOffset, yPosition - 25, 50, 50);
                                                                                }
                                                                            }
                                                                        }
                                                                    ]
                                                                })
                                                            });
                                                        })
                                                })
                                        })
                                })
                        })
                })

            updatePlayerAwards(playerID);
        }

        function fillStrikeZones(allPitches, sortedPitches) {
            var strikeZones = [];
            var strikeZonesHTML = '';

            var rowWidth = 5;
            var numberOfRows = Math.ceil(sortedPitches.length / rowWidth);

            for (let i = 0; i < numberOfRows; i++) {
                var temp1 = `scatter-row-${i}`;
                var temp2 = `label-row-${i}`;
                strikeZonesHTML += `
            <div class="strike-zone-scatter-plots">${temp1}</div>
            <div class="strike-zone-labels">${temp2}</div>
        `;
            }

            var scatterRowsHTML = new Array(numberOfRows).fill('');
            var labelRowsHTML = new Array(numberOfRows).fill('');

            for (let i = 0; i < sortedPitches.length; i++) {
                scatterRowsHTML[Math.floor(i / rowWidth)] += '<canvas width="200" height="300"></canvas>';
                labelRowsHTML[Math.floor(i / rowWidth)] += `<span>${sortedPitches[i]}</span>`;
            }

            for (let i = 0; i < numberOfRows; i++) {
                var temp = `scatter-row-${i}`;
                var pos = strikeZonesHTML.indexOf(temp);
                strikeZonesHTML = strikeZonesHTML.slice(0, pos) + scatterRowsHTML[i] + strikeZonesHTML.slice(pos + temp.length);

                temp = `label-row-${i}`;
                pos = strikeZonesHTML.indexOf(temp);
                strikeZonesHTML = strikeZonesHTML.slice(0, pos) + labelRowsHTML[i] + strikeZonesHTML.slice(pos + temp.length);
            }
            strikeZonesDiv.html(strikeZonesHTML);

            for (let i = 0; i < sortedPitches.length; i++) {
                strikeZones.push(strikeZonesDiv.find('canvas').get(i).getContext('2d'));
            }

            // var strikeZone = strikeZoneScatterPlotDiv.children().get(0).getContext('2d');
            // var strikeZone = strikeZoneScatterPlotCanvas[0].getContext('2d');

            const strikeZoneWidth = 200;
            const strikeZoneHeight = 300;

            var strikeZoneCenterX = strikeZoneWidth / 2;
            var strikeZoneCenterY = strikeZoneHeight / 2;
            var strikeZoneSide = 17 / 24;
            var sizeMult = 70; // 55

            // var strikeZoneTop = strikeZoneData[i][0][0];
            // var strikeZoneBottom = strikeZoneData[i][0][1];
            var strikeZoneTop = 3;
            var strikeZoneBottom = 1; // TODO
            var strikeZoneVertSize = strikeZoneTop - strikeZoneBottom;
            var strikeZoneCanvasLeft = strikeZoneCenterX - strikeZoneSide * sizeMult;
            var strikeZoneCanvasRight = strikeZoneCenterX + strikeZoneSide * sizeMult;
            var strikeZoneCanvasTop = strikeZoneCenterY - strikeZoneVertSize / 2 * sizeMult;
            var strikeZoneCanvasBottom = strikeZoneCenterY + strikeZoneVertSize / 2 * sizeMult;

            for (let i = 0; i < strikeZones.length; i++) {
                strikeZones[i].fillStyle = '#2c323a';
                strikeZones[i].fillRect(0, 0, strikeZoneWidth, strikeZoneHeight);

                strikeZones[i].strokeStyle = 'white';
                strikeZones[i].beginPath();

                strikeZones[i].moveTo(strikeZoneCanvasLeft, strikeZoneCanvasTop);
                strikeZones[i].lineTo(strikeZoneCanvasLeft, strikeZoneCanvasBottom);
                strikeZones[i].stroke();

                strikeZones[i].beginPath();
                strikeZones[i].moveTo(strikeZoneCanvasRight, strikeZoneCanvasTop);
                strikeZones[i].lineTo(strikeZoneCanvasRight, strikeZoneCanvasBottom);
                strikeZones[i].stroke();

                strikeZones[i].beginPath();
                strikeZones[i].moveTo(strikeZoneCanvasLeft, strikeZoneCanvasTop);
                strikeZones[i].lineTo(strikeZoneCanvasRight, strikeZoneCanvasTop);
                strikeZones[i].stroke();

                strikeZones[i].beginPath();
                strikeZones[i].moveTo(strikeZoneCanvasLeft, strikeZoneCanvasBottom);
                strikeZones[i].lineTo(strikeZoneCanvasRight, strikeZoneCanvasBottom);
                strikeZones[i].stroke();
            }

            var pitchesByType = [];
            for (let i = 0; i < sortedPitches.length; i++) {
                pitchesByType.push([]);
            }

            for (let i = 0; i < allPitches.length; i++) {
                if ('type' in allPitches[i]['details']) {
                    var pitchType = allPitches[i]['details']['type']['description'];
                    var index = sortedPitches.indexOf(pitchType);

                    if (index != -1) {
                        pitchesByType[index].push(allPitches[i]);
                    } else {
                        console.log(`UNKNOWN: ${pitchType}`);
                    }
                }
            }
            // console.log('pitchesByType');
            // console.log(pitchesByType);

            for (let i = 0; i < sortedPitches.length; i++) {
                // console.log(`=== i: ${i}, ${pitchesByType[i].length}`);
                for (let j = 0; j < pitchesByType[i].length; j++) {
                    var pitch = pitchesByType[i][j];
                    // console.log(j);
                    // console.log(pitch);

                    var pX = Math.round(pitch['pitchData']['coordinates']['pX'] * 1000) / 1000;
                    var pY = Math.round(pitch['pitchData']['coordinates']['pZ'] * 1000) / 1000;

                    var topY = strikeZoneCenterY - strikeZoneVertSize / 2 * sizeMult;
                    var bottomY = strikeZoneCenterY + strikeZoneVertSize / 2 * sizeMult;
                    var percentFromBottomY = (pY - strikeZoneBottom) / strikeZoneVertSize;

                    var pitchX = strikeZoneCenterX + pX * sizeMult;
                    var pitchY = bottomY - (percentFromBottomY * (bottomY - topY));

                    strikeZones[i].beginPath();
                    strikeZones[i].arc(pitchX, pitchY, 2, 0, 2 * Math.PI);
                    // strikeZone.fillStyle = 'rgba(0, 0, 255, 0.5)';
                    strikeZones[i].fillStyle = pitch['details']['ballColor']; // TODO
                    strikeZones[i].fill();
                }
            }

            // for (let i = 0; i < allPitches.length; i++) {
            //     var pitch = allPitches[i];

            //     var pX = Math.round(pitch['pitchData']['coordinates']['pX'] * 1000) / 1000;
            //     var pY = Math.round(pitch['pitchData']['coordinates']['pZ'] * 1000) / 1000;

            //     var topY = strikeZoneCenterY - strikeZoneVertSize / 2 * sizeMult;
            //     var bottomY = strikeZoneCenterY + strikeZoneVertSize / 2 * sizeMult;
            //     var percentFromBottomY = (pY - strikeZoneBottom) / strikeZoneVertSize;

            //     var pitchX = strikeZoneCenterX + pX * sizeMult;
            //     var pitchY = bottomY - (percentFromBottomY * (bottomY - topY));

            //     strikeZones[1].beginPath();
            //     strikeZones[1].arc(pitchX, pitchY, 2, 0, 2 * Math.PI);
            //     // strikeZone.fillStyle = 'rgba(0, 0, 255, 0.5)';
            //     strikeZones[1].fillStyle = pitch['details']['ballColor']; // TODO
            //     strikeZones[1].fill();
            // }


            // strikeZone.beginPath();
            // strikeZone.arc(100, 100, 8, 0, 2 * Math.PI);
            // strikeZone.fillStyle = 'red';
            // strikeZone.fill();
        }

        function updateGameLogSummary(playerID, gameDetails, gameDate) {
            var link = `https://statsapi.mlb.com${gameDetails['game']['link']}`;
            fetch(link)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(gameResponse => {
                    gameDataToSend = gameResponse;

                    var awayTeam = gameResponse['gameData']['teams']['away']['name'];
                    var homeTeam = gameResponse['gameData']['teams']['home']['name'];

                    var awayTeamAbbr = gameResponse['gameData']['teams']['away']['abbreviation'];
                    var homeTeamAbbr = gameResponse['gameData']['teams']['home']['abbreviation'];

                    var awayTeamRuns = gameResponse['liveData']['linescore']['teams']['away']['runs'];
                    var homeTeamRuns = gameResponse['liveData']['linescore']['teams']['home']['runs'];

                    gameLogSummary.html(`<br>${gameDate}`);
                    gameLogDetails.html(`
                <table id="playerStatsGameLog">
                    <tr>
                        <td><img width="30" height="30" class="logo" src="${Consts.teamsDetails[awayTeam][0]}">${awayTeamAbbr}</td>
                        <td>${awayTeamRuns}</td>
                    </tr>
                    <tr>
                        <td><img width="30" height="30" class="logo" src="${Consts.teamsDetails[homeTeam][0]}">${homeTeamAbbr}</td>
                        <td>${homeTeamRuns}</td>
                    </tr>
                </table>
                <p>${gameDetails['player']['fullName']}</p>
                <p>${gameDetails['stat']['summary']}</p>
            `);

                    detailsButton.prop('disabled', false);
                    xButton.prop('disabled', false);
                })

            // gameLogDetails.html(`game details for ${playerID}`);
        }

        detailsButton.off('click').on('click', function () {
            // var gameDetailsEvent = new CustomEvent('gameDetailsEvent', { detail: gameDataToSend});
            // document.dispatchEvent(gameDetailsEvent);
            setSelectedGame(gameDataToSend);
            navigate('/games');
        });

        xButton.off('click').on('click', function () {
            gameLogSummary.html('');
            gameLogDetails.html('<br><br><br><br>');

            detailsButton.prop('disabled', true);
            xButton.prop('disabled', true);
        });


        function updatePlayerAwards(playerID) {

            var link = `https://statsapi.mlb.com/api/v1/people/${playerID}?hydrate=awards`;
            fetch(link)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(awards => {
                    if ('awards' in awards['people'][0]) {
                        awards = awards['people'][0]['awards'];

                        awards = awards.reduce((acc, { name, team, date }) => {
                            if (!acc[name]) {
                                acc[name] = { name, teams: [], dates: [] };
                            }
                            acc[name].teams.push(team.teamName);
                            acc[name].dates.push(date);
                            return acc;
                        }, {});
                        awards = Object.values(awards);

                        awardsRef.current.render(
                            <ThemeProvider theme={createTheme({
                                palette: {
                                    mode: 'dark',
                                },
                            })}>
                                <Accordion sx={{ width: 1200 }} id="awards-accordion">
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                    >
                                        <h2>Awards ({awards.length})</h2>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box display="flex" flexWrap="wrap" gap={2}>
                                            {awards.map((award, index) => (
                                                <AwardCard
                                                    key={index}
                                                    award={award.name}
                                                    teams={award.teams}
                                                    dates={award.dates}
                                                />
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </ThemeProvider>
                        );
                    }
                })
        }
    }, [selectedPlayer]);

    return (
        <>
            <StatsModal open={modalOpen} handleClose={handleModalClose} modalData={modalData} />
            <Box sx={{ width: 1200 }}>
                <Typography variant="h5" noWrap component="div">
                    Player Stats
                </Typography>
                {/* <div style={{ float: 'left', height: '150px', marginBottom: '50px' }}> */}
                <div style={{ float: 'left', height: '150px' }}>
                    <span id="player-stats-photo"></span>
                    <span id="player-stats-label"></span>
                </div>
                {/* <div style={{ position: 'absolute', left: '600px' }}> */}
                <div style={{ position: 'absolute', left: '1800px' }}>
                    <ul id="player-details">
                        <li><span style={{ fontWeight: 'bold' }}>Age:</span> <span></span></li>
                        <li><span style={{ fontWeight: 'bold' }}>Position:</span> <span></span></li>
                        <li><span style={{ fontWeight: 'bold' }}>Debut:</span> <span></span></li>
                        <li><span style={{ fontWeight: 'bold' }}>Birthplace:</span> <span></span></li>
                    </ul>
                </div>
                <div id="all-years-switch-container">
                    <FormControlLabel id="all-years-switch" control={<Switch onChange={allYearsToggle} checked={allYearsChecked} />} label="All Years" />
                </div>
                <div className="player-team-color-banner" style={{ height: '30px' }}></div>
                <div className="player-team-color-banner" style={{ height: '20px' }}></div>
                <div id="pitching-stats-container">
                    <table id="pitching-stats">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Team</th>
                                <th><span className="tooltip" data-tooltip="Wins">W</span></th>
                                <th><span className="tooltip" data-tooltip="Losses">L</span></th>
                                <th><span className="tooltip" data-tooltip="Earned run average">ERA</span></th>
                                <th><span className="tooltip" data-tooltip="Games">G</span></th>
                                <th><span className="tooltip" data-tooltip="Games started">GS</span></th>
                                <th><span className="tooltip" data-tooltip="Saves">S</span></th>
                                <th><span className="tooltip" data-tooltip="Innings pitched">IP</span></th>
                                <th><span className="tooltip" data-tooltip="Strikeouts">SO</span></th>
                                <th><span className="tooltip" data-tooltip="Walks and hits per inning pitched">WHIP</span></th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    <div id="player-stats-year-select-container">
                        {/* <select id="player-stats-year-select"></select> */}
                    </div>
                    <div id="pitches-pie-chart">
                        <canvas></canvas>
                    </div>
                    <div id="pitches-scatter-plot">
                        <canvas></canvas>
                    </div>
                    <div style={{ clear: 'both' }}></div>
                    <h2>Pitch Locations</h2>
                    <div id="strike-zones">
                    </div>
                    <div id="innings-pitched-bar-chart">
                        <canvas></canvas>
                    </div>
                    <h2>Game Log</h2>
                    <table id="pitching-game-log">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Matchup</th>
                                <th>Pitches</th>
                                <th><span className="tooltip" data-tooltip="Innings pitched">IP</span></th>
                                <th><span className="tooltip" data-tooltip="Earned runs">ER</span></th>
                                <th><span className="tooltip" data-tooltip="Earned run average">ERA</span></th>
                                <th><span className="tooltip" data-tooltip="Hits">H</span></th>
                                <th><span className="tooltip" data-tooltip="Strikeouts">SO</span></th>
                                <th><span className="tooltip" data-tooltip="Walks">BB</span></th>
                                <th><span className="tooltip" data-tooltip="Walks and hits per inning pitched">WHIP</span></th>
                                <th>link</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <div id="hitting-stats-container">
                    <table id="hitting-stats">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th><span className="tooltip" data-tooltip="At bats">AB</span></th>
                                <th><span className="tooltip" data-tooltip="Runs">R</span></th>
                                <th><span className="tooltip" data-tooltip="Hits">H</span></th>
                                <th><span className="tooltip" data-tooltip="Home runs">HR</span></th>
                                <th><span className="tooltip" data-tooltip="Runs batted in">RBI</span></th>
                                <th><span className="tooltip" data-tooltip="Stolen bases">SB</span></th>
                                <th><span className="tooltip" data-tooltip="Batting average">AVG</span></th>
                                <th><span className="tooltip" data-tooltip="On-base %">OPB</span></th>
                                <th><span className="tooltip" data-tooltip="Slugging %">SLG</span></th>
                                <th><span className="tooltip" data-tooltip="On-base + slugging">OPS</span></th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    {/* <div id="hits-scatter-plot">
                        <canvas></canvas>
                    </div> */}
                </div>
                <div id="generic-stats-container">
                    <h2 style={{ marginTop: '0px' }}>More Stats</h2>
                    <div id="active-status-time-plot">
                        <canvas></canvas>
                    </div>
                    <div id="game-stats">
                        <button type="button" id="x-button" className="small-margin" disabled>X</button>
                        <button type="button" id="details-button" className="small-margin" disabled>Details</button>
                        <h2>Game stats<span id="game-log-summary"></span></h2>
                        <p id="game-log-details"></p>
                    </div>
                    <div id="player-awards-div">
                        <Box display="flex" flexWrap="wrap" gap={2} id="player-awards" ref={awardsContainerRef}>
                            <br /><br /><br /><br />
                        </Box>
                    </div>
                </div>
                <div id="missing-stats-container">
                    <Typography variant="h5" noWrap component="div" sx={{ mt: 5 }}>
                        No stats
                    </Typography>
                </div>
            </Box>
        </>
    )
}
