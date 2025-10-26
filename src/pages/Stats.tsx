// @ts-nocheck

import * as React from 'react';
import {
    Box,
    Button,
    Typography,
    FormControl,
    Select,
    MenuItem,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import DatePicker, { DateObject } from 'react-multi-date-picker';

import $ from 'jquery';
import 'datatables.net-dt';
import 'datatables.net-buttons/js/buttons.colVis.mjs';
import 'datatables.net-select-dt';
import dayjs from 'dayjs';
import SlimSelect from 'slim-select';

import { Consts } from '../consts/consts.ts';
import '../styles/style.css';
import '../styles/dtStyle.css';


export default function Stats({
}) {

    const [statsYear, setStatsYear] = React.useState(2025);
    const [statsGameType, setSeasonType] = React.useState('Regular Season');
    const [statsMode, setStatsMode] = React.useState('Hitting');

    const handleYearChange = (event) => {
        setStatsYear(event.target.value as string);
    };

    const handleStatsGameTypeChange = (event) => {
        setSeasonType(event.target.value as string);
    };

    const handleStatsModeChange = (event) => {
        setStatsMode(event.target.value as string);
    };

    const getGameType = (gameType) => {
        const gameTypes = {
            "Regular Season": "R",
            "Postseason": "P",
            "Spring Training": "S"
        };

        return gameTypes[gameType];
    }

    React.useEffect(() => {
        var hittingStatsTable = document.querySelector('#hitting-stats-dt');

        if ($.fn.DataTable.isDataTable(hittingStatsTable)) {
            hittingStatsDT = $(hittingStatsTable).DataTable();
        } else {
            var hittingStatsDT = $(hittingStatsTable).DataTable({
                select: false,
                dom: 'Bfrt',
                searching: false,
                pageLength: 50,
            })
        }
        hittingStatsDT.clear();

        var pitchingStatsTable = document.querySelector('#pitching-stats-dt');

        if ($.fn.DataTable.isDataTable(pitchingStatsTable)) {
            pitchingStatsDT = $(pitchingStatsTable).DataTable();
        } else {
            var pitchingStatsDT = $(pitchingStatsTable).DataTable({
                select: false,
                dom: 'Bfrt',
                searching: false,
                pageLength: 50,
            })
        }
        pitchingStatsDT.clear();

        if (statsMode === 'Hitting') {
            fetch(`https://statsapi.mlb.com/api/v1/teams/stats?group=hitting&stats=season&season=${statsYear}&gameType=${getGameType(statsGameType)}&sportIds=1`)
                .then(response => {
                    return response.json();
                })
                .then(hittingData => {
                    hittingData = hittingData['stats'][0];

                    $(hittingStatsTable).show();
                    $(pitchingStatsTable).hide();

                    for (let i = 0; i < hittingData['splits'].length; i++) {
                        var teamStats = hittingData['splits'][i];

                        var teamName = teamStats['team']['name'];
                        var teamIndex = Consts.findTeamIndex(teamName);
                        teamName = `<img width="30" height="30" style="vertical-align: middle; margin-right: 10px;" src="${Consts.teamsDetails[Consts.teams[teamIndex[0]][teamIndex[1]][teamIndex[2]]][0]}" /><span>${teamName}</span>`;

                        var runs = teamStats['stat']['runs'];
                        var hits = teamStats['stat']['hits'];
                        var doubles = teamStats['stat']['doubles'];
                        var triples = teamStats['stat']['triples'];
                        var homeRuns = teamStats['stat']['homeRuns'];
                        var rbi = teamStats['stat']['rbi'];
                        var avg = teamStats['stat']['avg'];
                        var obp = teamStats['stat']['obp'];
                        var slg = teamStats['stat']['slg'];
                        var ops = teamStats['stat']['ops'];
                        var stolenBases = teamStats['stat']['stolenBases'];

                        hittingStatsDT.row.add([teamName, runs, hits, doubles, triples, homeRuns, rbi, avg, obp, slg, ops, stolenBases]);
                    }
                    hittingStatsDT.draw(true);
                })


        } else if (statsMode === 'Pitching') {
            fetch(`https://statsapi.mlb.com/api/v1/teams/stats?group=pitching&stats=season&season=${statsYear}&gameType=${getGameType(statsGameType)}&sportIds=1`)
                .then(response => {
                    return response.json();
                })
                .then(pitchingData => {
                    pitchingData = pitchingData['stats'][0];

                    $(hittingStatsTable).hide();
                    $(pitchingStatsTable).show();

                    for (let i = 0; i < pitchingData['splits'].length; i++) {
                        var teamStats = pitchingData['splits'][i];

                        var teamName = teamStats['team']['name'];
                        var teamIndex = Consts.findTeamIndex(teamName);
                        teamName = `<img width="30" height="30" style="vertical-align: middle; margin-right: 10px;" src="${Consts.teamsDetails[Consts.teams[teamIndex[0]][teamIndex[1]][teamIndex[2]]][0]}" /><span>${teamName}</span>`;

                        var era = teamStats['stat']['era'];
                        var inningsPitched = teamStats['stat']['inningsPitched'];
                        var hits = teamStats['stat']['hits'];
                        var runs = teamStats['stat']['runs'];
                        var homeRuns = teamStats['stat']['homeRuns'];
                        var strikeOuts = teamStats['stat']['strikeOuts'];
                        var walks = teamStats['stat']['baseOnBalls'];
                        var avg = teamStats['stat']['avg'];
                        var whip = teamStats['stat']['whip'];
                        var shutouts = teamStats['stat']['shutouts'];
                        var saves = teamStats['stat']['saves'];

                        pitchingStatsDT.row.add([teamName, era, inningsPitched, hits, runs, homeRuns, strikeOuts, walks, avg, whip, shutouts, saves]);
                    }
                    pitchingStatsDT.draw(true);
                })
        }
    }, [statsYear, statsGameType, statsMode]);

    return (
        <Box>
            <Grid container spacing={2} alignItems="center" mt={2} ml={2} mb={3}>
                <Grid>
                    <Typography variant="h6" noWrap component="div">
                        Year
                    </Typography>
                </Grid>
                <Grid>
                    <Box sx={{ minWidth: 120, width: 200 }}>
                        <FormControl fullWidth>
                            <Select defaultValue={2025} displayEmpty
                                value={statsYear}
                                onChange={handleYearChange}
                            >
                                <MenuItem value={2025}>2025</MenuItem>
                                <MenuItem value={2024}>2024</MenuItem>
                                <MenuItem value={2023}>2023</MenuItem>
                                <MenuItem value={2022}>2022</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
                <Grid>
                    <Box sx={{ minWidth: 120, width: 200 }}>
                        <FormControl fullWidth>
                            <Select defaultValue={2025} displayEmpty
                                value={statsGameType}
                                onChange={handleStatsGameTypeChange}
                            >
                                <MenuItem value={"Regular Season"}>Regular Season</MenuItem>
                                <MenuItem value={"Postseason"}>Postseason</MenuItem>
                                <MenuItem value={"Spring Training"}>Spring Training</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
                <Grid>
                    <ToggleButtonGroup
                        color="primary"
                        value={statsMode}
                        exclusive
                        onChange={handleStatsModeChange}
                        aria-label="Platform"
                    >
                        <ToggleButton value="Hitting">Hitting</ToggleButton>
                        <ToggleButton value="Pitching">Pitching</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
            </Grid>
            <Box sx={{ width: 1800, marginLeft: 10 }}>
                <table id="hitting-stats-dt">
                    <thead>
                        <tr>
                            <th>Team</th>
                            <th><span className="tooltip" data-tooltip="Runs">R</span></th>
                            <th><span className="tooltip" data-tooltip="Hits">H</span></th>
                            <th><span className="tooltip" data-tooltip="Doubles">2B</span></th>
                            <th><span className="tooltip" data-tooltip="Triples">3B</span></th>
                            <th><span className="tooltip" data-tooltip="Home runs">HR</span></th>
                            <th><span className="tooltip" data-tooltip="Runs batted in">RBI</span></th>
                            <th><span className="tooltip" data-tooltip="Batting average">AVG</span></th>
                            <th><span className="tooltip" data-tooltip="On-base %">OPB</span></th>
                            <th><span className="tooltip" data-tooltip="Slugging %">SLG</span></th>
                            <th><span className="tooltip" data-tooltip="On-base + slugging">OPS</span></th>
                            <th><span className="tooltip" data-tooltip="Stolen bases">SB</span></th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <table id="pitching-stats-dt">
                    <thead>
                        <tr>
                            <th>Team</th>
                            <th><span className="tooltip" data-tooltip="Earned run average">ERA</span></th>
                            <th><span className="tooltip" data-tooltip="Innings Pitched">IP</span></th>
                            <th><span className="tooltip" data-tooltip="Hits">H</span></th>
                            <th><span className="tooltip" data-tooltip="Runs">R</span></th>
                            <th><span className="tooltip" data-tooltip="Home runs">HR</span></th>
                            <th><span className="tooltip" data-tooltip="Strikeouts">SO</span></th>
                            <th><span className="tooltip" data-tooltip="Walks">BB</span></th>
                            <th><span className="tooltip" data-tooltip="Batting average">AVG</span></th>
                            <th><span className="tooltip" data-tooltip="Walks and hits per inning pitched">WHIP</span></th>
                            <th><span className="tooltip" data-tooltip="Shutouts">SHO</span></th>
                            <th><span className="tooltip" data-tooltip="Saves">SV</span></th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </Box>
        </Box>
    )
}