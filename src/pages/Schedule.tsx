import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import classicThemePlugin from '@fullcalendar/react/themes/classic';
import { Temporal } from '@js-temporal/polyfill';
import {
    Box,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { TeamSelect } from '../components/TeamSelect';
import { TeamName } from '../consts/consts';
import { fetchSchedule } from '../services/gamesService';

// import { TimeZone, useBasedash } from '../context/BasedashContext.tsx';

export const Schedule = () => {
    // const { timeZone, setTimeZone } = useBasedash();

    // const handleTimeZoneChange = (event: SelectChangeEvent) => {
    //     setTimeZone(event.target.value as TimeZone);
    // };

    const [selectedTeam, setSelectedTeam] = useState<TeamName | ''>('');
    // const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
    // TODO

    const [scheduleYear, setScheduleYear] = useState(
        Temporal.Now.plainDateISO().year
    );
    const firstYear = 2010;

    const handleYearChange = (event: SelectChangeEvent<number>) => {
        setScheduleYear(Number(event.target.value));
    };

    const handleTeamChange = useCallback((val: string[0]) => {
        if (val.length === 1) {
            setSelectedTeam(val[0] as TeamName);
        } else {
            setSelectedTeam('');
        }
    }, []);

    useEffect(() => {
        const fetchGameEvents = async (
            year: number,
            selectedTeam: TeamName | ''
        ) => {
            if (selectedTeam === '') {
                // setGameEvents([]);
            } else {
                // fetch season
                // const games = fetchSchedule();
                // https://statsapi.mlb.com/api/v1/schedule/?sportId=1&startDate=2027-01-01&endDate=2027-06-06&teamId=118
            }
        };

        fetchGameEvents(scheduleYear, selectedTeam);
    }, [scheduleYear, selectedTeam]);

    const renderEventContent = (eventInfo) => {
        return (
            <>
                <b>{eventInfo.timeText}</b>
                <i>{eventInfo.event.title}</i>
            </>
        );
    };

    return (
        <>
            <Box>
                <Stack spacing={3} sx={{ mt: 5, ml: 10, mb: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Typography variant="h6" sx={{ minWidth: 60 }}>
                            Year
                        </Typography>
                        <Select<number>
                            value={scheduleYear}
                            onChange={handleYearChange}
                            sx={{ width: 200 }}
                        >
                            {Array.from({
                                length:
                                    Temporal.Now.plainDateISO().year -
                                    firstYear +
                                    1,
                            }).map((_, i) => {
                                const year =
                                    Temporal.Now.plainDateISO().year - i;
                                return (
                                    <MenuItem key={year} value={year}>
                                        {year}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Typography variant="h6" sx={{ minWidth: 60 }}>
                            Team
                        </Typography>
                        <Box sx={{ width: 200 }}>
                            <TeamSelect
                                currentValue={selectedTeam}
                                onTeamChange={handleTeamChange}
                                multiple={false}
                            />
                        </Box>
                    </Box>
                </Stack>

                <Box
                    sx={{
                        width: '60%',
                        ml: 5,
                    }}
                >
                    <FullCalendar
                        plugins={[
                            dayGridPlugin,
                            classicThemePlugin,
                            // any other plugins
                        ]}
                        colorScheme="dark"
                        // initialView="dayGridMonth"
                        initialView="dayGridMonth"
                        weekends={true}
                        events={[
                            { title: 'Meeting', start: new Date() },
                            {
                                title: 'Meeting',
                                start: new Date(
                                    Date.now() + 24 * 60 * 60 * 1000
                                ),
                            },
                        ]}
                        eventContent={renderEventContent}
                    />
                </Box>
            </Box>
        </>
    );
};
