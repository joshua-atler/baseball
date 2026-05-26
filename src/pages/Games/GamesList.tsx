// @ts-nocheck

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { HiExternalLink } from 'react-icons/hi';

import { Box, Button, ButtonGroup, Label, Checkbox, FormControlLabel, LinearProgress, Skeleton, Typography } from '@mui/material';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import { useTheme } from '@mui/material/styles';

import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-select-dt';
import dayjs from 'dayjs';
import SlimSelect from 'slim-select';

import { TeamSelect } from '../../components/TeamSelect.tsx';

import 'react-multi-date-picker/styles/backgrounds/bg-dark.css';
import { useBasedash } from '../../context/BasedashContext.tsx';
import { fetchSchedule } from '../../services/gamesService.ts';
import { transformGames } from '../../utils/gameTransformers.ts';
import { formatter, shortYearFormatter } from '../../utils/dateFormatters.ts';

DataTable.use(DT);

export default function GamesList({}) {
    const theme = useTheme();
    const { setSelectedGame, setSelectedGameMetadata } = useBasedash();

    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState('manual');
    const datePickerRef = useRef();

    const [dates, setDates] = useState([new Date(), new Date()]);
    const [month, day, year] = shortYearFormatter.format(dates[0]).split('/');
    const isSameDay = dates.length === 1 || (formatter.format(dates[0]) === formatter.format(dates[1]));

    const [isLiveGames, setIsLiveGames] = useState(false);
    const [isAutoUpdate, setIsAutoUpdate] = useState(false);

    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

    const [tableData, setTableData] = useState([]);

    const columns = [
        { data: 'gamePk', title: '', visible: false },
        { data: 'gameMetadata', title: '', visible: false},
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

    const handleSelect = (e, dt, type, indexes) => {
        setSelectedGame(tableData[indexes].gamePk);
        setSelectedGameMetadata({
            tickets: tableData[indexes].gameMetadata.tickets,
            broadcasts: tableData[indexes].gameMetadata.broadcasts,
            seriesStatus: tableData[indexes].gameMetadata.seriesStatus
        })
    };

    const handleDeselect = (e, dt, type, indexes) => {
        setSelectedGame(null);
        setSelectedGameMetadata(null);
    };

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
        let allData = [];

        const startDate = formatter.format(dates[0]);
        if (dates.length === 2) {
            const endDate = formatter.format(dates[1]);
        }
        const endDate = (dates.length === 2) ? formatter.format(dates[1]) : formatter.format(dates[0]);

        const gamesJson = await fetchSchedule(startDate, endDate);
        const gamesData = await transformGames(gamesJson, isLiveGames, selectedTeams, timeZone, (p) => setProgress(p));
        setTableData(gamesData);
        setIsLoading(null);
    }

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }} id="games-filters">
                <DatePicker
                    ref={datePickerRef}
                    value={dates}
                    format="MM/DD/YY"
                    minDate="01/01/20"
                    onChange={(e, newValue) => {
                        setDates(newValue.validatedValue.map(v => new Date(v)));
                        if (newValue.validatedValue.length === 2) {
                            datePickerRef.current?.closeCalendar();
                        }
                    }}
                    className="bg-dark"
                    inputClass="date-select-input"
                    dateSeparator=" - "
                    range
                    showOtherDays
                />
                <ButtonGroup variant="contained">
                    <Button disabled={isLoading !== null} onClick={() => handleDateButtonClick(-1)}>Yesterday</Button>
                    <Button disabled={isLoading !== null} onClick={() => handleDateButtonClick(0)}>Today</Button>
                    <Button disabled={isLoading !== null} onClick={() => handleDateButtonClick(1)}>Tomorrow</Button>
                </ButtonGroup>
                <Button variant="contained" className="margin" disabled={isLoading !== null} onClick={() => updateTableRef.current?.('manual')}>Update</Button>
                {isSameDay && <Typography sx={{ userSelect: 'none' }}><a target="_blank" rel="noopener noreferrer" href={`https://www.mlb.com/stories/mlb-top-plays-${month}-${day}-${year}`}>
                    {'Top Plays'}<HiExternalLink style={{ verticalAlign: 'middle' }} />
                </a></Typography>}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'stretch', mb: 2, gap: 0 }}>
                <Box sx={{ mr: 3, width: 600 }}>
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
                    <Box sx={{
                        width: 1200,
                        '& .dataTable tbody tr:hover': {
                            backgroundColor: (theme) => `${theme.palette.custom.lightGray} !important`,
                        },
                        '& .dataTable tbody tr.selected': {
                            backgroundColor: (theme) => `${theme.palette.custom.darkGray} !important`,
                        }
                    }}>
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
                            }}
                            onSelect={handleSelect}
                            onDeselect={handleDeselect}
                        />
                    </Box>
                )
            }
        </>
    );
}
