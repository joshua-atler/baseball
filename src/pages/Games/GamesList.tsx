// @ts-nocheck

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import React from 'react';
import { useLocation } from 'react-router-dom';

import { Box, Button, ButtonGroup, Label, Checkbox, FormControlLabel, LinearProgress, Skeleton } from '@mui/material';
import DatePicker, { DateObject } from 'react-multi-date-picker';

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
// import 'datatables.net-buttons/js/buttons.colVis.mjs';
// import 'datatables.net-select-dt';
import dayjs from 'dayjs';
import SlimSelect from 'slim-select';

import { TeamSelect } from '../../components/TeamSelect.tsx';

import { Consts } from '../../consts/consts.ts';
import '../../styles/dtStyle.css';
import '../../styles/datepickerStyle.css';
import '../../styles/slimSelectStyle.css';
import 'react-multi-date-picker/styles/backgrounds/bg-dark.css';
import { useBasedash } from '../../context/BasedashContext.tsx';
import { fetchSchedule } from '../../services/gamesService.ts';
import { transformGames } from '../../utils/gameTransformers.ts';

DataTable.use(DT);

const formatter = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
});

const teamNameToKey = Object.fromEntries(
    Object.entries(Consts.teamInfo).map(([key, val]) => [val.name, key])
);

export default function GamesList({
    setSelectedGame
}) {

    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState('manual');
    const datePickerRef = useRef();

    const [dates, setDates] = useState([new Date(), new Date()]);

    const [isLiveGames, setIsLiveGames] = useState(false);
    const [isAutoUpdate, setIsAutoUpdate] = useState(false);

    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

    const [tableData, setTableData] = useState([]);

    const columns = [
        { data: 'date', title: 'Date' },
        { data: 'time', title: 'Time' },
        { data: 'away', title: 'Away' },
        { data: 'awayScore', title: '' },
        { data: 'home', title: 'Home' },
        { data: 'homeScore', title: '' },
        { data: 'inning', title: 'Inning' },
        { data: 'status', title: 'Status' },
    ];

    const { timeZone } = useBasedash();

    const updateTableRef = useRef(null);

    // const reset = true;

    // const datesButton = document.querySelector('#dates-button');
    // const liveGamesSwitch = document.querySelector('#live-games');
    // const autoUpdateSwitch = document.querySelector('#auto-update');
    // const datesErrorSpan = document.querySelector('#dates-error');

    // useEffect(() => {
    //     if (dates.length > 0) {
    //         const adjustedDates = dates.length === 1 ? [dates[0], dates[0]] : dates;
    //         datesRef.current = adjustedDates.map(date => date.format('MM/DD/YYYY'));
    //     }
    // }, [dates]);

    // const handleDateChange = (newDates) => {
    //     setDates(newDates);
    // }

    // const formatDate = useMemo(() => {
    //     if (dates.length >= 1) {
    //         return dates[0].format('MM/DD/YY');
    //     } else {
    //         return '';
    //     }
    // }, [dates]);


    const handleTeamChange = useCallback((val) => {
        setSelectedTeams(val);
    }, []);

    const handleDateButtonClick = (offset) => {
        setDates(() => {
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + offset);

            const newDates = [newDate, newDate];
            return newDates;
        });
    };

    useEffect(() => {
        updateTableRef.current = (loadingType: string) => {
            setIsLoading(loadingType);
            setProgress(0);
            (async () => {
                fillTableWithDates(dates);
            })();

            console.log(`loadingType: ${loadingType}`);
        }

        updateTableRef.current('manual');
    }, [dates, selectedTeams, isLiveGames]);

    useEffect(() => {
        let intervalId;
        if (isAutoUpdate) {
            intervalId = setInterval(function () {
                updateTableRef.current?.('auto');
            }, 5000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        }
    }, [isAutoUpdate]);

    async function fillTableWithDates(dates) {
        console.log('fillTableWithDates');
        let allData = [];

        // if (liveGamesSwitch.checked) {
        //     let yesterday = getDates(-1);
        //     let tomorrow = getDates(1);
        //     startDate = new Date(yesterday.year, yesterday.month, yesterday.day).toLocaleDateString('en-US');
        //     endDate = new Date(tomorrow.year, tomorrow.month, tomorrow.day).toLocaleDateString('en-US');
        // }

        console.log('dates');
        console.log(dates);
        console.log(dates.length);
        console.log(dates[0]);
        console.log(dates[1]);

        const startDate = formatter.format(dates[0]);
        if (dates.length === 2) {
            const endDate = formatter.format(dates[1]);
        }
        const endDate = (dates.length === 2) ? formatter.format(dates[1]) : formatter.format(dates[0]);

        const gamesJson = await fetchSchedule(startDate, endDate);
        console.log('gamesJson');
        console.log(gamesJson);
        const gamesData = await transformGames(gamesJson, isLiveGames, selectedTeams, timeZone);

        // console.log(`isLiveGames: ${isLiveGames}`);
        // let gamesForDates = [];
        // for (let i = 0; i < gamesJson['dates'].length; i++) {
        //     console.log(`i: ${i}`);
        //     for (let j = 0; j < gamesJson['dates'][i]['games'].length; j++) {
        //         // console.log(gamesJson['dates'][i]['games'][j]);
        //         // if (liveGamesSwitch.checked && gamesJson['dates'][i]['games'][j]['status']['abstractGameState'] != 'Live') {
        //         if (isLiveGames && gamesJson['dates'][i]['games'][j]['status']['abstractGameState'] != 'Live') {
        //             // skip
        //         } else {
        //             if (selectedTeams.length === 0) {
        //                 gamesForDates.push(gamesJson['dates'][i]['games'][j]);
        //             } else {
        //                 const awayTeam = teamNameToKey[gamesJson['dates'][i]['games'][j]['teams']['away']['team']['name']];
        //                 const homeTeam = teamNameToKey[gamesJson['dates'][i]['games'][j]['teams']['home']['team']['name']];

        //                 if (selectedTeams.includes(awayTeam) || selectedTeams.includes(homeTeam)) {
        //                     gamesForDates.push(gamesJson['dates'][i]['games'][j]);
        //                 }
        //             }
        //         }
        //     }
        // }

        // console.log('gamesForDates');
        // console.log(gamesForDates);

        // let gamesList = [];
        // for (let i = 0; i < gamesForDates.length; i++) {
        //     if (gamesForDates[i]['status']['detailedState'] != 'Suspended') {
        //         gamesList.push(gamesForDates[i]['gamePk']);

        //         // if (reset) {
        //         //     dt.row.add(Array(8).fill('-'));
        //         // }
        //     }
        // }

        // console.log('gamesList');
        // console.log(gamesList);

        // let progressAmount = 0;

        // let gamesDetails = Array(gamesList.length);
        // for (let i = 0; i < gamesForDates.length; i++) {
        //     let url = gamesForDates[i]['link'];

        //     const gameResponse = await fetch('https://statsapi.mlb.com' + url);
        //     const data = await gameResponse.json();
        //     let row_i = gamesList.indexOf(data['gameData']['game']['pk']);
        //     gamesDetails[row_i] = data;

        //     let now = new Date();
        //     let dateString = new Date(data['gameData']['datetime']['dateTime']).toLocaleDateString('en-US');
        //     let time = new Date(data['gameData']['datetime']['dateTime']);

        //     time.setHours(time.getHours() + Consts.timeZoneOffset[timeZone]);

        //     let timeString = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        //     let awayScore = '-';
        //     let awayTeam = data['gameData']['teams']['away']['name'];
        //     let homeScore = '-';
        //     let homeTeam = data['gameData']['teams']['home']['name'];
        //     let inningData = '';
        //     let outs = '';
        //     let count = '';
        //     let status = data['gameData']['status']['abstractGameState'];
        //     let started = time < now;

        //     let homeWin = false;

        //     if (data['liveData']['linescore']['currentInning'] !== undefined && status == 'Live') {
        //         let inningState = data['liveData']['linescore']['inningState'].substring(0, 3);
        //         inningData = inningState + ' ' + data['liveData']['linescore']['currentInning'].toString();
        //         outs = data['liveData']['linescore']['outs'];
        //         outs = '<span style="color: #EFB21F">&#11044;</span>'.repeat(outs) + '<span style="color: #888888">&#11044;</span>'.repeat(3 - outs);
        //         count = data['liveData']['linescore']['balls'].toString() + '-' + data['liveData']['linescore']['strikes'].toString();

        //         let runners = data['liveData']['linescore']['offense'];
        //         let bases = ['third', 'second', 'first'];
        //         let baseData = [];
        //         for (let base of bases) {
        //             if (base in runners) {
        //                 baseData.push(['#EFB21F', '#EFB21F']);
        //             } else {
        //                 baseData.push(['#888888', '#AAAAAA']);
        //             }
        //         }
        //         bases = `<svg class="svg" width="35" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16.25" aria-label="base"><title>Bases.</title>
        //         <rect fill="${baseData[0][0]}" stroke-width="1" stroke="${baseData[0][1]}" width="6" height="6" transform="translate(5, 7.25) rotate(-315)" rx="1px" ry="1px"></rect>
        //         <rect fill="${baseData[1][0]}" stroke-width="1" stroke="${baseData[1][1]}" width="6" height="6" transform="translate(12, 0.5) rotate(-315)" rx="1px" ry="1px"></rect>
        //         <rect fill="${baseData[2][0]}" stroke-width="1" stroke="${baseData[2][1]}" width="6" height="6" transform="translate(19, 7.25) rotate(-315)" rx="1px" ry="1px"></rect>
        //         </svg>`;

        //         inningData = '<span class="inning-num">' + inningData + '</span>';
        //         inningData = inningData + bases + '&nbsp;' + outs + '&nbsp;' + count;
        //         inningData = '<span class="svg-span">' + inningData + '</span>';
        //     }

        //     let detailedState = data['gameData']['status']['detailedState'];
        //     if (status != 'Preview' && started) {
        //         if (data['liveData']['linescore']['teams']['away']['runs'] !== undefined) {
        //             awayScore = data['liveData']['linescore']['teams']['away']['runs'];
        //         }
        //         if (data['liveData']['linescore']['teams']['home']['runs'] !== undefined) {
        //             homeScore = data['liveData']['linescore']['teams']['home']['runs'];
        //         }
        //     }
        //     if (status != 'Preview' && !started) {
        //         status = 'Preview';
        //     }

        //     if (status == 'Final' && detailedState == 'Final') {
        //         if (homeScore > awayScore) {
        //             homeWin = true;
        //             homeScore = `<span style="font-weight: bold;">${homeScore.toString()} &#9664;</span>`;
        //         } else if (awayScore > homeScore) {
        //             homeWin = false;
        //             awayScore = `<span style="font-weight: bold;">${awayScore.toString()} &#9664;</span>`;
        //         }
        //     } else {
        //         status = detailedState;
        //     }

        //     // let currData = dt.row(row_i).data();
        //     const currData = {};
        //     // if (currData == undefined) {
        //     //     currData = new Array(8);
        //     // }
        //     currData['date'] = dateString;
        //     currData['time'] = timeString;
        //     if (awayTeam in Consts.teamsDetails) {
        //         currData['away'] = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[awayTeam].logo}"><span>${awayTeam}</span>`;
        //     } else {
        //         currData['away'] = awayTeam;
        //     }
        //     currData['awayScore'] = awayScore;
        //     if (homeTeam in Consts.teamsDetails) {
        //         currData['home'] = `<img width="30" height="30" class="logo" src="${Consts.teamsDetails[homeTeam].logo}"><span>${homeTeam}</span>`;
        //     } else {
        //         currData['home'] = homeTeam;
        //     }
        //     currData['homeScore'] = homeScore;

        //     if (status == 'Final') {
        //         if (homeWin) {
        //             currData['home'] = `<span style="font-weight: bold;">${currData['home']}</span>`
        //             currData['away'] = `<span style="color: #aaaaaa;">${currData['away']}</span>`
        //             currData['awayScore'] = `<span style="color: #aaaaaa;">${currData['awayScore']}</span>`;
        //         } else {
        //             currData['away'] = `<span style="font-weight: bold;">${currData['away']}</span>`;
        //             currData['home'] = `<span style="color: #aaaaaa;">${currData['home']}</span>`;
        //             currData['homeScore'] = `<span style="color: #aaaaaa;">${currData['homeScore']}</span>`;
        //         }
        //     }

        //     currData['inning'] = inningData;
        //     currData['status'] = status;
        //     status = data['gameData']['status']['abstractGameState'];

        //     allData.push(currData);

        //     progressAmount += 1;
        //     setProgress(100 * progressAmount / gamesForDates.length);
        // }
        // setTableData((prev) => ({ ...prev, gamesDetails: gamesDetails }));

        console.log('setting table data');
        setTableData(gamesData);
        setIsLoading(null);
        // return allData;
    }


    // function getDates(offset) {
    //     let currentDate = new Date();

    //     let year = currentDate.getFullYear();
    //     let month = currentDate.getMonth();
    //     let day = currentDate.getDate() + offset;

    //     return { year, month, day };
    // }


    // useEffect(() => {
    // if (prevLocation.current === location['pathname']) {
    //     return;
    // }
    // prevLocation.current = location['pathname'];

    // let teamsSelect = document.querySelector('#teams-select');

    // let newStylesheet = $('<link>', {
    //     rel: 'stylesheet',
    //     href: 'https://unpkg.com/slim-select@latest/dist/slimselect.css'
    // });

    // $('head').append(newStylesheet);

    // let selectOptions = [];
    // const divisionNames = ['AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West'];

    // let leagues = ['AL', 'NL'];
    // for (let league of leagues) {
    //     for (let i = 0; i < 3; i++) {
    //         let divisionData = Consts.teamAbbrs[league][i].map((team, index) => {
    //             let teamPadded = team.padEnd(3, '\u00A0');
    //             return {
    //                 text: team,
    //                 html: `<img width="30" height="30" style="vertical-align: middle; margin-right: 10px;" src="${Consts.teamsDetails[Consts.teams[league][i][index]].logo}" /><span style="font-family: monospace; font-size: 16px; font-weight: bold; line-height: 30px;">${teamPadded}</span>`,
    //                 value: Consts.teams[league][i][index]
    //             };
    //         });

    //         selectOptions.push(divisionData);
    //     }
    // }

    // let selectData = selectOptions.map((options, index) => {
    //     return {
    //         label: divisionNames[index],
    //         selectAll: true,
    //         options: options
    //     }
    // });

    // let teamsDropdown = new SlimSelect({
    //     select: teamsSelect,
    //     data: selectData,

    //     settings: {
    //         showSearch: false,
    //         placeholderText: 'All teams',
    //         closeOnSelect: false,
    //         allowDeselect: true,
    //         maxSelected: 5
    //     },
    //     events: {
    //         beforeChange: (newVal, oldVal) => {
    //             return true
    //         },
    //         afterChange: (newVal, oldVal) => {
    //             setTeamsFilter(teamsDropdown.getSelected());
    //             teamsFilterRef.current = teamsDropdown.getSelected();

    //             let box = document.querySelectorAll('.ss-values .ss-value .ss-value-text');

    //             for (let i = 0; i < box.length; i++) {
    //                 const currentText = box[i].textContent.trim();
    //                 const foundOption = selectOptions.flat().find(opt => opt.text === currentText);

    //                 if (foundOption && !box[i].querySelector('img')) {
    //                     const teamData = Consts.teamsDetails[foundOption.value];
    //                     if (teamData) {
    //                         box[i].innerHTML = `
    //                             <img width="30" height="30" 
    //                                 style="vertical-align: middle; margin-right: 10px;" 
    //                                 src="${teamData.logo}" />
    //                             <span>${currentText}</span>
    //                         `;
    //                     }
    //                 }
    //             }

    //             setNewSettings(true);
    //             return true;
    //         }
    //     }
    // })
    // document.querySelectorAll('.ss-content').forEach(el => el.classList.add('roster-select'));

    // let intervalId;

    // autoUpdateSwitch.onchange = function () {
    //     if (autoUpdateSwitch.checked) {
    //         intervalId = setInterval(function () {
    //             updateTable(false);
    //         }, 5000);
    //     } else {
    //         clearInterval(intervalId);
    //     }
    // }

    // teamsDropdown.setSelected(teamsFilter);

    // const timer = setInterval(() => {
    //     setProgress((oldProgress) => {
    //         if (oldProgress === 100) {
    //             return 0;
    //         }
    //         const diff = Math.random() * 10;
    //         return Math.min(oldProgress + diff, 100);
    //     });
    // }, 50);

    // return () => {
    //     clearInterval(timer);
    // };
    // }, [location]);

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "stretch", mb: 2, gap: 0 }} id="games-filters">
                <DatePicker
                    ref={datePickerRef}
                    value={dates}
                    format="MM/DD/YY"
                    minDate="01/01/20"
                    onChange={(e, newValue) => {
                        setDates(newValue.validatedValue.map(v => new Date(v)));
                        if (newValue.validatedValue.length === 2) {
                            if (datePickerRef.current) {
                                datePickerRef.current.closeCalendar();
                            }
                        }
                    }}
                    className="bg-dark"
                    inputClass="date-select-input"
                    dateSeparator=" - "
                    range
                    showOtherDays
                />
                <ButtonGroup variant="contained" sx={{ mr: 2 }}>
                    <Button disabled={isLoading !== null} onClick={() => handleDateButtonClick(-1)}>Yesterday</Button>
                    <Button disabled={isLoading !== null} onClick={() => handleDateButtonClick(0)}>Today</Button>
                    <Button disabled={isLoading !== null} onClick={() => handleDateButtonClick(1)}>Tomorrow</Button>
                </ButtonGroup>
                <Button variant="contained" className="margin" disabled={isLoading !== null} onClick={() => updateTableRef.current?.('manual')}>Update</Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'stretch', mb: 2, gap: 0 }}>
                <Box sx={{ mr: 3, width: 500 }}>
                    <TeamSelect
                        currentValue={selectedTeams}
                        onTeamChange={handleTeamChange}
                        multiple={true} />
                </Box>
                <FormControlLabel control={<Checkbox checked={isLiveGames} onChange={(e) => { setIsLiveGames(e.target.checked) }} />} label="Live games" />
                <FormControlLabel control={<Checkbox checked={isAutoUpdate} onChange={(e) => {
                    setIsAutoUpdate(e.target.checked);
                }} />} label="Auto update" />
            </Box>
            <Box sx={{ width: 500, visibility: isLoading !== null ? 'visible' : 'hidden' }}>
                <LinearProgress variant='determinate' color='success' value={progress}
                    sx={{ transition: 'none' }} />
            </Box>
            {
                (isLoading === 'manual') ? (
                    <Box sx={{ width: 1200 }}>
                        <Skeleton variant="text" width="20%" height={40} sx={{ mb: 2 }} />
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <Skeleton variant="rectangular" width="100%" height={30} />
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ width: 1200 }}>
                        <DataTable
                            hidden={true}
                            data={tableData}
                            columns={columns}
                            options={{
                                paging: true,
                                searching: false,
                                select: {
                                    info: false
                                },
                                pageLength: 20,
                                dom: "Bript",
                                columnDefs: [],
                                ordering: false,
                                buttons: [],
                                scrollCollapse: true,
                                language: {
                                    emptyTable: "No games for selected filters",
                                    zeroRecords: "No games for selected filters"
                                }
                            }} />
                    </Box>
                )
            }
        </>
    );
}
