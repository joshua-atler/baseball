// @ts-nocheck

import * as React from 'react';
import ReactDOM from 'react-dom/client';

import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';

import '../../styles/style.css';

import $ from 'jquery';
import datepicker from 'js-datepicker';
import 'datatables.net-dt';
import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-select-dt';
import 'datatables.net-rowgroup';
import SlimSelect from 'slim-select';

import { Consts } from '../../consts/consts.ts';



export default function Rosters({ setSelectedPlayer }) {

    var positionTypes = {
        'Pitcher': 'Pitchers',
        'Two-Way Player': 'Two-Way Players',
        'Catcher': 'Catchers',
        'Infielder': 'Infielders',
        'Outfielder': 'Outfielders',
        'Hitter': 'Designated Hitter'
    };

    function formatDate(originalDate) {
        const date = new Date(originalDate);
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${day}/${year}`;
    }

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
        var selectedTeam = null;
        var selectedRoster = [];
        var allTeams = [];

        const rosterTeamLogo = $(document.querySelector('#roster-team-logo'));
        const rosterTeamLabel = $(document.querySelector('#roster-team-label'));
        const teamColorBanners = $(document.querySelectorAll('.roster-team-color-banner'));

        $.fn.dataTable.ext.order['positions-order'] = function (settings, col) {
            var order = ['Pitchers', 'Two-Way Players', 'Catchers', 'Infielders', 'Outfielders', 'Designated Hitter'];
            return this.api().column(col, { order: 'index' }).nodes().map(function (cell) {
                var text = $(cell).text();
                return order.indexOf(text) !== -1 ? order.indexOf(text) : order.length;
            });
        };

        $.fn.dataTable.ext.order['last-names-order'] = function (settings, col) {
            return this.api().column(col, { order: 'index' }).nodes().map(function (cell) {
                var sortValue = $(cell).find('.roster-name').data('sort');
                return sortValue !== undefined ? sortValue : Infinity;
            });
        };

        var table = document.querySelector('#roster-dt');
        var dt = $(table).DataTable({
            select: true,
            pageLength: 30,
            dom: 'Bfrt',
            columnDefs: [
                {
                    orderDataType: 'last-names-order',
                    targets: 0
                },
                {
                    orderDataType: 'positions-order',
                    targets: 7
                },
                {
                    orderable: false,
                    targets: [1, 2, 3, 4, 5, 6]
                },
                {
                    visible: false,
                    targets: 7
                },
                {
                    searchable: true,
                    targets: 0
                },
                {
                    searchable: false,
                    targets: '_all'
                }
            ],
            searching: true,
            ordering: true,
            buttons: [],
            scrollCollapse: true,
            // scrollY: '600px',
            rowGroup: {
                dataSrc: 7,
            },
            order: [[7, 'asc']],
            orderFixed: [7, 'asc'],
            initComplete: function () {
                var api = this.api();

                api.on('order.dt', function (e, settings, order) {
                    var currentOrder = api.order();

                    if (currentOrder[0][1] === 'desc') {
                        api.order([currentOrder[0][0], 'asc']).draw();
                    }
                });
            },
            language: {
                emptyTable: '',
                zeroRecords: '',
                search: 'Search players: '
            }
        });

        dt.off('select');
        dt.off('deselect');

        dt.on('select', function (e, dt, type, indexes) {
            var selectedIndex = indexes[0];
            var playerID = dt.row(selectedIndex).data()[0].split('/v1/people/')[1].split('/')[0];
            var teamIndex = findTeamIndex(selectedTeam);
            // var playerSelectEvent = new CustomEvent('playerSelectEvent', {
            //     detail: {
            //         playerID: playerID,
            //         color: Consts.teamColors[teamIndex[0]][teamIndex[1]][teamIndex[2]]
            //     }
            // });
            // document.dispatchEvent(playerSelectEvent);
            setSelectedPlayer({ playerID: playerID, color: [Consts.teamColors[teamIndex[0]][teamIndex[1]][teamIndex[2]], Consts.teamSecondColors[teamIndex[0]][teamIndex[1]][teamIndex[2]]] });
        });

        dt.on('deselect', function (e, dt, type, indexes) {
            // var playerSelectEvent = new CustomEvent('playerSelectEvent', {
            //     detail: {
            //         playerID: null,
            //         color: null
            //     }
            // });
            // document.dispatchEvent(playerSelectEvent);
            setSelectedPlayer({ playerID: null, color: null });
        });

        // get all team IDs
        fetch(`https://statsapi.mlb.com/api/v1/teams?leagueIds=103,104`)
            .then(response => {
                return response.json();
            })
            .then(teamsData => {
                allTeams = teamsData['teams'];
            })
            .catch(error => { });

        var teamsSelect = document.querySelector('#roster-teams-select');

        var newStylesheet = $('<link>', {
            rel: 'stylesheet',
            href: 'https://unpkg.com/slim-select@latest/dist/slimselect.css'
        });

        $('head').append(newStylesheet);

        setTimeout(function () {
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
            selectData.unshift({ placeholder: true, text: 'Select a team' });

            var teamsDropdown = new SlimSelect({
                select: teamsSelect,
                data: selectData,

                settings: {
                    showSearch: false,
                    placeholderText: 'Select a team',
                    closeOnSelect: true,
                    allowDeselect: true,
                },
                events: {
                    beforeChange: (newVal, oldVal) => {
                        return true
                    },
                    afterChange: (newVal, oldVal) => {
                        selectedTeam = teamsDropdown.getSelected()[0];

                        var box = document.querySelectorAll('.ss-values .ss-value .ss-value-text');

                        for (let i = 0; i < box.length; i++) {
                            if (!box[i].innerHTML.includes('<img')) {
                                var teamPadded = box[i].innerHTML.padEnd(4, '\u00A0');
                                box[i].innerHTML = `<img width="30" height="30" style="vertical-align: middle; margin-right: 10px;" src="${Consts.teamsDetails[selectOptions.flat().filter((option) => option.text == box[i].innerHTML)[0].value][0]}" />`;
                            }
                        }

                        dt.clear();
                        $(table).find('tbody').hide();

                        rosterTeamLogo.html('');
                        rosterTeamLabel.html('');

                        if (newVal.length > 0 && !newVal[0]['placeholder']) {
                            var teamIndex = findTeamIndex(selectedTeam);
                            teamColorBanners.eq(0).css('background-color', Consts.teamColors[teamIndex[0]][teamIndex[1]][teamIndex[2]]);
                            teamColorBanners.eq(1).css('background-color', Consts.teamSecondColors[teamIndex[0]][teamIndex[1]][teamIndex[2]]);

                            var teamID = allTeams.find(t => t.name === selectedTeam).id;

                            fetch(`https://statsapi.mlb.com/api/v1/teams/${teamID}/roster?rosterType=active&season=2024&date=9/30/2024`)
                                // fetch(`https://statsapi.mlb.com/api/v1/teams/${teamID}/roster?rosterType=active`)
                                .then(response => {
                                    return response.json();
                                })
                                .then(rosterResponse => {

                                    selectedRoster = rosterResponse['roster'];

                                    dt.draw(false);

                                    var allPlayerIDs = selectedRoster.map(player => player.person.id);
                                    var allPlayerInfo = [];

                                    fetch(`https://statsapi.mlb.com/api/v1/people?personIds=${allPlayerIDs.join(',')}`)
                                        .then(response => {
                                            return response.json();
                                        })
                                        .then(allPlayerResponse => {
                                            allPlayerInfo = allPlayerResponse['people'];

                                            for (let i = 0; i < allPlayerInfo.length; i++) {
                                                var currentPlayer = allPlayerInfo[i];

                                                var photo = `<img class="roster-player-photo" src="https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/r_max/w_180,q_auto:best/v1/people/${currentPlayer['id']}/headshot/silo/current">`;
                                                var playerName = currentPlayer['fullName'];
                                                var playerLastName = currentPlayer['lastName'];
                                                var jerseyNumber = '---';
                                                if ('primaryNumber' in currentPlayer) {
                                                    jerseyNumber = `#${currentPlayer['primaryNumber']}`;
                                                }
                                                var position = currentPlayer['primaryPosition']['abbreviation'];
                                                var batThrow = `${currentPlayer['batSide']['code']}/${currentPlayer['pitchHand']['code']}`;
                                                var weight = currentPlayer['weight'];
                                                var height = currentPlayer['height'];
                                                var birthday = formatDate(currentPlayer['birthDate']);
                                                var debut = '---';
                                                if ('mlbDebutDate' in currentPlayer) {
                                                    debut = formatDate(currentPlayer['mlbDebutDate']);
                                                }
                                                var positionType = positionTypes[currentPlayer['primaryPosition']['type']];

                                                dt.row.add(Array(8).fill('-'));
                                                dt.row(i).data([
                                                    `${photo}<span class="roster-name" data-sort="${playerLastName}">${playerName}</span><span class="roster-jersey">${jerseyNumber}</span>`,
                                                    position,
                                                    batThrow,
                                                    weight,
                                                    height,
                                                    birthday,
                                                    debut,
                                                    positionType
                                                ]);
                                            }

                                            dt.draw(true);
                                            $(document.querySelector('#roster-dt')).find('thead th:nth-child(1)').click();

                                            setTimeout(function () {
                                                $(document.querySelector('#roster-dt')).find('thead th:nth-child(1)').click();
                                                $(table).find('tbody').show();
                                                rosterTeamLogo.html(`<img width="80" height="80" style="vertical-align: middle;" src="${Consts.teamsDetails[selectedTeam][0]}" />`);
                                                rosterTeamLabel.html(selectedTeam);
                                            }, 100);
                                        })
                                        .catch(error => { });
                                })
                                .catch(error => { });


                        } else {
                            teamColorBanners.css('background-color', 'transparent');
                            dt.draw(true);
                        }

                        // dt.draw(true);
                        // $(htmlNode.querySelector('#roster-dt')).find('thead th:nth-child(2)').click();
                        // roster.find('thead th:nth-child(2)').click();

                        // dt.draw(true);

                        return true;
                    }
                }
            })
        }, 50);
    }, []);


    return (
        <>
            <Box sx={{ width: 1200 }}>
                <Typography variant="h5" noWrap component="div">
                    Active Rosters
                </Typography>
                <div style={{ height: '100px' }}>
                    <span id="roster-team-logo"></span>
                    <span id="roster-team-label"></span>
                    <div id="roster-teams-select-container">
                        <select id="roster-teams-select"></select>
                    </div>
                </div>
                <div className="roster-team-color-banner" style={{ height: '30px' }}></div>
                <div className="roster-team-color-banner" style={{ height: '20px', marginBottom: '10px' }}></div>
                <table id="roster-dt">
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>Position</th>
                            <th>Bat/Throw</th>
                            <th>Weight</th>
                            <th>Height</th>
                            <th>Birthdate</th>
                            <th>MLB Debut</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </Box>
        </>
    )
}