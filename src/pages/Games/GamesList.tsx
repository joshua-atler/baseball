// @ts-nocheck

import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { Box, Button, ButtonGroup, Label, Checkbox, FormControlLabel, LinearProgress } from '@mui/material';
import DatePicker, { DateObject } from 'react-multi-date-picker';

import $ from 'jquery';
import 'datatables.net-dt';
import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-select-dt';
import dayjs from 'dayjs';
import SlimSelect from 'slim-select';

import { Consts } from '../../consts/consts.ts';
import '../../styles/style.css';
import '../../styles/dtStyle.css';
import '../../styles/datepickerStyle.css';
import '../../styles/slimSelectStyle.css';
import 'react-multi-date-picker/styles/backgrounds/bg-dark.css';


export default function GamesList({
    dates,
    setDates,
    tableData,
    setTableData,
    isLiveGames,
    setIsLiveGames,
    isAutoUpdate,
    setIsAutoUpdate,
    selectedGame,
    setSelectedGame,
    teamsFilter,
    setTeamsFilter,
    lastTimeZone,
    setLastTimeZone
}) {
    const datesRef = React.useRef(dates);
    const teamsFilterRef = React.useRef(teamsFilter);
    const [progress, setProgress] = React.useState(0);
    const [newSettings, setNewSettings] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const location = useLocation();
    const prevLocation = React.useRef(null);

    const updateDates = () => {
        if (dates.length > 0) {
            const adjustedDates = dates.length === 1 ? [dates[0], dates[0]] : dates;
            datesRef.current = adjustedDates.map(date => date.format('MM/DD/YYYY'));
        }
    }

    React.useEffect(() => {
        updateDates();
    }, [dates]);

    const handleDateChange = (newDates) => {
        setDates(newDates);
    }

    const formatDate = React.useMemo(() => {
        if (dates.length >= 1) {
            return dates[0].format('MM/DD/YY');
        } else {
            return '';
        }
    }, [dates]);

    const resetProgress = () => {
        // setDisableAnimation(true);
        setProgress(0);
        // setTimeout(() => setDisableAnimation(false), 100);
    };

    React.useEffect(() => {
        if (prevLocation.current === location['pathname']) {
            return;
        }
        prevLocation.current = location['pathname'];

        const yesterdayButton = document.querySelector('#yesterday-button');
        const todayButton = document.querySelector('#today-button');
        const tomorrowButton = document.querySelector('#tomorrow-button');
        const datesButton = document.querySelector('#dates-button');
        const liveGamesSwitch = document.querySelector('#live-games');
        const autoUpdateSwitch = document.querySelector('#auto-update');
        const datesErrorSpan = document.querySelector('#dates-error');

        var teamsSelect = document.querySelector('#teams-select');

        var newStylesheet = $('<link>', {
            rel: 'stylesheet',
            href: 'https://unpkg.com/slim-select@latest/dist/slimselect.css'
        });

        $('head').append(newStylesheet);
        // just include?

        var selectOptions = [];
        const divisionNames = ['AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West'];

        var leagues = ['AL', 'NL'];
        for (var league of leagues) {
            for (let i = 0; i < 3; i++) {
                var divisionData = Consts.teamAbbrs[league][i].map((team, index) => {
                    var teamPadded = team.padEnd(3, '\u00A0');
                    return {
                        text: team,
                        html: `<img width="30" height="30" style="vertical-align: middle; margin-right: 10px;" src="${Consts.teamsDetails[Consts.teams[league][i][index]][0]}" /><span style="font-family: monospace; font-size: 16px; font-weight: bold; line-height: 30px;">${teamPadded}</span>`,
                        value: Consts.teams[league][i][index]
                    };
                });

                selectOptions.push(divisionData);
            }
        }

        var selectData = selectOptions.map((options, index) => {
            return {
                label: divisionNames[index],
                selectAll: true,
                options: options
            }
        });

        var teamsDropdown = new SlimSelect({
            select: teamsSelect,
            data: selectData,

            settings: {
                showSearch: false,
                placeholderText: 'All teams',
                closeOnSelect: false,
                allowDeselect: true,
                maxSelected: 5
            },
            events: {
                beforeChange: (newVal, oldVal) => {
                    return true
                },
                afterChange: (newVal, oldVal) => {
                    // selectedTeams = teamsDropdown.getSelected();
                    setTeamsFilter(teamsDropdown.getSelected());
                    teamsFilterRef.current = teamsDropdown.getSelected();

                    var box = document.querySelectorAll('.ss-values .ss-value .ss-value-text');

                    for (let i = 0; i < box.length; i++) {
                        if (!box[i].innerHTML.includes('<img')) {
                            var teamPadded = box[i].innerHTML.padEnd(4, '\u00A0');
                            box[i].innerHTML = `<img width="30" height="30" style="vertical-align: middle; margin-right: 10px;" src="${Consts.teamsDetails[selectOptions.flat().filter((option) => option.text == box[i].innerHTML)[0].value][0]}" />`;
                        }
                    }

                    setNewSettings(true);
                    return true;
                }
            }
        })

        function updateTable(reset) {
            var selectedIndex = dt.row({ selected: true }).index();

            if (newSettings) {
                reset = true;
                setNewSettings(false);
            }
            // console.log('updateTable');
            // console.log(reset);

            // if (newDates.length === 2) {
            // if (start.getRange()['start'] == undefined || end.getRange()[    'end'] == undefined) {

            // } else {
            if (reset) {
                setIsLoading(true);
                $(document.querySelector('#dt_wrapper')).hide();
                $(document.querySelector('#games-progress')).show();
            }

            resetProgress();

            (async () => {
                // console.log(start.getRange()['start']);
                // var allData = await fillTableWithDates(start.getRange()['start'].toLocaleDateString('en-US'), start.getRange()['end'].toLocaleDateString('en-US'), reset);
                var allData = await fillTableWithDates(datesRef.current[0], datesRef.current[1], reset);

                dt.draw(false);

                for (let i = 0; i < allData.length; i++) {
                    dt.row(i).data(allData[i]);
                }
                setTableData((prev) => ({ ...prev, dtData: dt.data() }));

                if (reset) {
                    $(document.querySelector('#dt_wrapper')).show();
                    $(document.querySelector('#games-progress')).hide();
                    setIsLoading(false);
                    resetProgress();
                }

                dt.draw(false);
            })();

            var detail;
            if (selectedIndex === undefined) {
                detail = null;
            } else {
                detail = gamesDetails[selectedIndex];
            }
            // var gameDetailsEvent = new CustomEvent('gameDetailsEvent', { detail: detail });
            // document.dispatchEvent(gameDetailsEvent);

            // if (selectedGame !== null) {
            //     console.log('-----');
            //     dt.row(0).select();
            // }
        }

        datesButton.onclick = function () {
            updateTable(true);
        }

        var intervalId;

        liveGamesSwitch.onchange = (e) => {
            updateTable(true);
        };

        autoUpdateSwitch.onchange = function () {
            if (autoUpdateSwitch.checked) {
                intervalId = setInterval(function () {
                    updateTable(false);
                }, 5000);
            } else {
                clearInterval(intervalId);
            }
        }

        const handleDateButtonClick = (offset) => {
            setDates(() => {
                const newDate = new Date();
                newDate.setDate(newDate.getDate() + offset);

                const newDates = [new DateObject(newDate), new DateObject(newDate)];
                datesRef.current = newDates.map(date => date.format("MM/DD/YYYY"));

                updateTable(true);
                return newDates;
            });
        };

        yesterdayButton.onclick = () => handleDateButtonClick(-1);
        todayButton.onclick = () => handleDateButtonClick(0);
        tomorrowButton.onclick = () => handleDateButtonClick(1);

        var table = document.querySelector('#dt');
        var dt;

        if ($.fn.DataTable.isDataTable(table)) {
            dt = $(table).DataTable();
        } else {
            var dt = $(table).DataTable({
                select: {
                    info: false
                },
                pageLength: 20,
                dom: 'Bript',
                columnDefs: [],
                ordering: false,
                buttons: [],
                scrollCollapse: true,
                language: {
                    emptyTable: 'No games for selected filters',
                    zeroRecords: 'No games for selected filters'
                }
            });
        }

        if (tableData.dtData !== null) {
            dt.rows.add(tableData.dtData);
            if (tableData.selectedIndex !== null) {
                dt.row(tableData.selectedIndex).select();
            }
            dt.draw();
            if (tableData.page !== null) {
                dt.page(tableData.page).draw('page');
            }
        }

        var gamesList = [];
        var gamesDetails;
        if (tableData.gamesDetails !== null) {
            gamesDetails = tableData.gamesDetails;
        }

        async function fillTableWithDates(startDate, endDate, reset) {
            var allData = [];

            if (reset) {
                dt.clear();
            }

            if (liveGamesSwitch.checked) {
                var yesterday = getDates(-1);
                var tomorrow = getDates(1);
                startDate = new Date(yesterday.year, yesterday.month, yesterday.day).toLocaleDateString('en-US');
                endDate = new Date(tomorrow.year, tomorrow.month, tomorrow.day).toLocaleDateString('en-US');
            }

            const response = await fetch(Consts.baseURL + `/schedule?sportId=1&startDate=${startDate}&endDate=${endDate}`);
            const gamesJson = await response.json();
            // fetch(Consts.baseURL + `/schedule?sportId=1&startDate=${startDate}&endDate=${endDate}`)
            // .then((response) => response.json())
            // .then((gamesJson) => {
            var gamesForDates = [];
            for (let i = 0; i < gamesJson['dates'].length; i++) {
                for (let j = 0; j < gamesJson['dates'][i]['games'].length; j++) {
                    if (liveGamesSwitch.checked && gamesJson['dates'][i]['games'][j]['status']['abstractGameState'] != 'Live') {
                        // skip
                    } else {
                        if (teamsFilterRef.current.length == 0) {
                            gamesForDates.push(gamesJson['dates'][i]['games'][j]);
                        } else {
                            var homeTeamFixed = gamesJson['dates'][i]['games'][j]['teams']['away']['team']['name'];
                            var awayTeamFixed = gamesJson['dates'][i]['games'][j]['teams']['home']['team']['name'];

                            if (teamsFilterRef.current.includes(homeTeamFixed) || teamsFilterRef.current.includes(awayTeamFixed)) {
                                gamesForDates.push(gamesJson['dates'][i]['games'][j]);
                            }

                            if (teamsFilterRef.current.includes('Oakland Athletics')) {
                                if (homeTeamFixed == 'Athletics' || awayTeamFixed == 'Athletics') {
                                    gamesForDates.push(gamesJson['dates'][i]['games'][j]);
                                }
                            }
                        }
                    }
                }
            }

            gamesList = [];
            for (let i = 0; i < gamesForDates.length; i++) {
                if (gamesForDates[i]['status']['detailedState'] != 'Suspended') {
                    gamesList.push(gamesForDates[i]['gamePk']);

                    if (reset) {
                        dt.row.add(Array(8).fill('-'));
                    }
                }
            }

            dt.draw(true);

            var progressAmount = 0;

            var timeZone = localStorage.getItem('timeZone') || 'ET';

            gamesDetails = Array(gamesList.length);
            for (let i = 0; i < gamesForDates.length; i++) {
                var url = gamesForDates[i]['link'];

                const gameResponse = await fetch('https://statsapi.mlb.com' + url);
                const data = await gameResponse.json();
                // fetch('https://statsapi.mlb.com' + url)
                //     .then((response) => response.json())
                //     .then((data) => {
                // console.log(i);
                var row_i = gamesList.indexOf(data['gameData']['game']['pk']);
                gamesDetails[row_i] = data;

                var now = new Date();
                var dateString = new Date(data['gameData']['datetime']['dateTime']).toLocaleDateString('en-US');
                var time = new Date(data['gameData']['datetime']['dateTime']);

                time.setHours(time.getHours() + Consts.timeZoneOffset[timeZone]);

                var timeString = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                var awayScore = '-';
                var awayTeam = data['gameData']['teams']['away']['name'];
                var homeScore = '-';
                var homeTeam = data['gameData']['teams']['home']['name'];
                var inningData = '';
                var outs = '';
                var count = '';
                var status = data['gameData']['status']['abstractGameState'];
                var started = time < now;

                var homeWin = false;

                if (data['liveData']['linescore']['currentInning'] !== undefined && status == 'Live') {
                    var inningState = data['liveData']['linescore']['inningState'].substring(0, 3);
                    inningData = inningState + ' ' + data['liveData']['linescore']['currentInning'].toString();
                    outs = data['liveData']['linescore']['outs'];
                    outs = '<span style="color: #EFB21F">&#11044;</span>'.repeat(outs) + '<span style="color: #888888">&#11044;</span>'.repeat(3 - outs);
                    count = data['liveData']['linescore']['balls'].toString() + '-' + data['liveData']['linescore']['strikes'].toString();

                    var runners = data['liveData']['linescore']['offense'];
                    var bases = ['third', 'second', 'first'];
                    var baseData = [];
                    for (var base of bases) {
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

                var detailedState = data['gameData']['status']['detailedState'];
                if (status != 'Preview' && started) {
                    if (data['liveData']['linescore']['teams']['away']['runs'] !== undefined) {
                        awayScore = data['liveData']['linescore']['teams']['away']['runs'];
                    }
                    if (data['liveData']['linescore']['teams']['home']['runs'] !== undefined) {
                        homeScore = data['liveData']['linescore']['teams']['home']['runs'];
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

                var currData = dt.row(row_i).data();
                if (currData == undefined) {
                    currData = new Array(8);
                }
                currData[0] = dateString;
                currData[1] = timeString;
                if (awayTeam in Consts.teamsDetails) {
                    currData[2] = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[awayTeam][0]}"><span>${awayTeam}</span>`;
                } else {
                    currData[2] = awayTeam;
                }
                currData[3] = awayScore;
                if (homeTeam in Consts.teamsDetails) {
                    currData[4] = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[homeTeam][0]}"><span>${homeTeam}</span>`;
                } else {
                    currData[4] = homeTeam;
                }
                currData[5] = homeScore;

                if (status == 'Final') {
                    if (homeWin) {
                        currData[4] = `<span style="font-weight: bold;">${currData[4]}</span>`
                        currData[2] = `<span style="color: #aaaaaa;">${currData[2]}</span>`
                        currData[3] = `<span style="color: #aaaaaa;">${currData[3]}</span>`;
                    } else {
                        currData[2] = `<span style="font-weight: bold;">${currData[2]}</span>`;
                        currData[4] = `<span style="color: #aaaaaa;">${currData[4]}</span>`;
                        currData[5] = `<span style="color: #aaaaaa;">${currData[5]}</span>`;
                    }
                }

                currData[6] = inningData;
                currData[7] = status;
                status = data['gameData']['status']['abstractGameState'];

                allData.push(currData);

                progressAmount += 1;
                setProgress(100 * progressAmount / gamesForDates.length);
            }
            // });
            setTableData((prev) => ({ ...prev, gamesDetails: gamesDetails }));
            return allData;
        }


        dt.on('select', function (e, dt, type, indexes) {
            var selectedIndex = indexes[0];
            setSelectedGame(gamesDetails[selectedIndex]);
            setTableData((prev) => ({ ...prev, selectedIndex: selectedIndex }));
            // var gameDetailsEvent = new CustomEvent('gameDetailsEvent', { detail: gamesDetails[selectedIndex] });
            // document.dispatchEvent(gameDetailsEvent);
        });

        dt.on('deselect', function (e, dt, type, indexes) {
            setSelectedGame(null);
            setTableData((prev) => ({ ...prev, selectedIndex: null }));
            // var gameDetailsEvent = new CustomEvent('gameDetailsEvent', { detail: null });
            // document.dispatchEvent(gameDetailsEvent);
        });

        dt.on('page', function (e, dt2, type, indexes) {
            setTableData((prev) => ({ ...prev, page: dt.page() }));
        });

        function getDates(offset) {
            var currentDate = new Date();

            var year = currentDate.getFullYear();
            var month = currentDate.getMonth();
            var day = currentDate.getDate() + offset;

            return { year, month, day };
        }

        if (dt.rows().count() == 0) {
            updateTable(true);
        }

        var timeZone = localStorage.getItem('timeZone') || 'ET';
        if (timeZone !== lastTimeZone) {
            setLastTimeZone(timeZone);


            if (lastTimeZone !== '') {
                updateTable(true);
            }
        }

        teamsDropdown.setSelected(teamsFilter);

        const timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress === 100) {
                    return 0;
                }
                const diff = Math.random() * 10;
                return Math.min(oldProgress + diff, 100);
            });
        }, 50);

        return () => {
            clearInterval(timer);
        };
    }, [location]);

    return (
        <>
            {/* <div id="container"> */}
            {/* <div id="games-filters"> */}
            <Box sx={{ display: "flex", alignItems: "stretch", mb: 2, gap: 0 }} id="games-filters">
                <DatePicker
                    // multiple
                    value={dates}
                    format="MM/DD/YY"
                    // inputValue={formatDate}
                    minDate="01/01/20"
                    onChange={handleDateChange}
                    className="bg-dark"
                    inputClass="date-select-input"
                    dateSeparator=" - "
                    range
                    showOtherDays
                // render={(value) => {
                //     // console.log('value');
                //     // console.log(typeof value);
                //     // if (Array.isArray(value) && value.length === 2 && value[0] === value[1]) {
                //     //     return value[0];
                //     // }
                //     // // return value.join(" - ");
                //     // return value;
                //     return value;
                // }}
                // onOpen={() => setOpen(true)}
                // onClose={() => setOpen(false)}
                // open={open}
                // animations={[
                //     transition({ duration: 800, from: 35 })
                // ]}
                />
                {/* <DatePicker sx={{ mr: 2 }} label="Start"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    renderInput={(params) => <TextField {...params} />} />
                <DatePicker sx={{ mr: 2 }} label="End"
                    value={endDate}
                    minDate={startDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} />} /> */}
                {/* <input id="calendar1" className="margin" placeholder="start date" /> */}
                {/* <input id="calendar2" className="margin" placeholder="end date" /> */}
                <ButtonGroup variant="contained" sx={{ mr: 2 }}>
                    <Button id="yesterday-button" disabled={isLoading}>Yesterday</Button>
                    <Button id="today-button" disabled={isLoading}>Today</Button>
                    <Button id="tomorrow-button" disabled={isLoading}>Tomorrow</Button>
                </ButtonGroup>
                <Button variant="contained" id="dates-button" className="margin" disabled={isLoading}>Update</Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'stretch', mb: 2, gap: 0 }}>
                {/* dropdown select */}
                {/* <Select /> */}
                <Box sx={{ mr: 3 }} id="teams-select-container">
                    <select id="teams-select" multiple></select>
                </Box>
                <FormControlLabel control={<Checkbox id="live-games" checked={isLiveGames} onChange={(e) => { setIsLiveGames(e.target.checked) }} />} label="Live games" />
                <FormControlLabel control={<Checkbox id="auto-update" checked={isAutoUpdate} onChange={(e) => { setIsAutoUpdate(e.target.checked) }} />} label="Auto update" />
            </Box>
            <Box id="games-progress" hidden={!isLoading}>
                <LinearProgress variant="determinate" color="success" value={progress}
                    // sx={{
                    //     transition: disableAnimation ? "none" : "all 0.3s ease-in-out",
                    // }} />
                    sx={{
                        transition: "none",
                    }} />
            </Box>
            <div style={{ display: 'flex', marginBottom: '16px' }}>

                {/* <div id="live-switch-container">
                    <label className="switch-light switch-ios" onClick={() => { }}>
                        <input id="live-games" type="checkbox" />
                        <strong>Live games</strong>
                        <span>
                            <span>Off</span>
                            <span>On</span>
                            <a></a>
                        </span>
                    </label>
                </div>
                <div id="auto-update-container">
                    <label className="switch-light switch-ios" onClick={() => { }}>
                        <input id="auto-update" type="checkbox" />
                        <strong>Auto update</strong>
                        <span>
                            <span>Off</span>
                            <span>On</span>
                            <a></a>
                        </span>
                    </label>
                </div> */}
            </div>
            <span id="dates-error" hidden>Select both a start and end date</span>
            <Box id="dt-box">
                <table id="dt">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Away</th>
                            <th>Away Score</th>
                            <th>Home</th>
                            <th>Home Score</th>
                            <th>Inning</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </Box>
            {/* </div> */}
        </>
    );
}
