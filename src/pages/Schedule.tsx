import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/palette.css';
import '@fullcalendar/react/themes/classic/theme.css';

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
import { Consts, TeamName } from '../consts/consts';
import { fetchSchedule } from '../services/gamesService';
import { fetchSeason } from '../services/standingsService';

// import { TimeZone, useBasedash } from '../context/BasedashContext.tsx';

export const Schedule = () => {
    // const { timeZone, setTimeZone } = useBasedash();

    // const handleTimeZoneChange = (event: SelectChangeEvent) => {
    //     setTimeZone(event.target.value as TimeZone);
    // };

    const [selectedTeam, setSelectedTeam] = useState<TeamName | ''>('');
    // const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
    const [gameEvents, setGameEvents] = useState([]);
    // TODO

    const [scheduleYear, setScheduleYear] = useState(
        Temporal.Now.plainDateISO().year
    );
    const firstYear = 2015;

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
                setGameEvents([]);
            } else {
                const season = await fetchSeason(year);
                const seasonData = season.seasons[0];
                console.log('seasonData');

                const startDate = seasonData.springStartDate;
                const endDate = seasonData.postSeasonEndDate;

                const games = await fetchSchedule(
                    startDate,
                    endDate,
                    Consts.teamInfo[selectedTeam].id
                );

                console.log(games);

                setGameEvents(
                    games.dates.flatMap((date) =>
                        date.games.map((game) => {
                            // const title = `${
                            //     Consts.teamInfo[game.teams.away.team.name]
                            //         ?.abbr ?? '---'
                            // } @ ${
                            //     Consts.teamInfo[game.teams.home.team.name]
                            //         ?.abbr ?? '---'
                            // }`;

                            // const ti

                            const isHome =
                                Consts.teamInfo[selectedTeam].id ===
                                Consts.teamInfo[game.teams.home.team.name]?.id;

                            return {
                                // title: title,
                                start: new Date(game.gameDate),
                                gamePk: game.gamePk,
                                away: game.teams.away.team.name,
                                home: game.teams.home.team.name,
                                awayLogo:
                                    Consts.teamInfo[game.teams.away.team.name]
                                        ?.logo ?? '',
                                homeLogo:
                                    Consts.teamInfo[game.teams.home.team.name]
                                        ?.logo ?? '',
                                color: isHome ? '#1e3a8a' : '#374151', // Home vs. Away colors
                                // url: 'http://www.google.com',
                            };
                        })
                    )
                );
            }
        };

        fetchGameEvents(scheduleYear, selectedTeam);
    }, [scheduleYear, selectedTeam]);

    console.log(gameEvents);

    const renderEventContent = (eventInfo) => {
        const { awayLogo, homeLogo } = eventInfo.event.extendedProps;
        return (
            <>
                <b>{eventInfo.timeText}</b>
                {/* <i>{eventInfo.event.title}</i> */}
                {/* <span>span</span> */}
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <img
                        src={awayLogo}
                        style={{ width: '20px', height: '20px' }}
                    />
                    <span style={{ margin: '0 2px', fontWeight: '500' }}>
                        @
                    </span>
                    <img
                        src={homeLogo}
                        style={{ width: '20px', height: '20px' }}
                    />
                </span>
            </>
        );
    };

    return (
        <>
            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mt: 5,
                        mb: 5,
                        ml: 10,
                        mr: 10,
                        width: '75%',
                    }}
                >
                    <Stack spacing={3}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                            }}
                        >
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
                                        Temporal.Now.plainDateISO().year -
                                        i +
                                        1;
                                    return (
                                        <MenuItem key={year} value={year}>
                                            {year}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </Box>

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                            }}
                        >
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
                            p: 1,
                            outline: '1px solid white',
                        }}
                    >
                        <Stack spacing={3}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                }}
                            >
                                <Typography variant="h6" sx={{ minWidth: 60 }}>
                                    Legend
                                </Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 3,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '100px',
                                        height: '50px',
                                        backgroundColor: '#1e3a8a',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: '20px',
                                    }}
                                >
                                    <Typography variant="body1">
                                        Home
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: '100px',
                                        height: '50px',
                                        backgroundColor: '#374151',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: '20px',
                                    }}
                                >
                                    <Typography variant="body1">
                                        Away
                                    </Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: '75%',
                        ml: 10,
                    }}
                >
                    <FullCalendar
                        plugins={[
                            dayGridPlugin,
                            classicThemePlugin,
                            // any other plugins
                        ]}
                        colorScheme="dark"
                        initialView="dayGridMonth"
                        // initialView="listWeek"
                        weekends={true}
                        // events={[
                        //     { title: 'Meeting', start: new Date() },
                        //     {
                        //         title: 'Meeting',
                        //         start: new Date(
                        //             Date.now() + 24 * 60 * 60 * 1000
                        //         ),
                        //     },
                        // ]}
                        events={gameEvents}
                        eventContent={renderEventContent}
                        eventDisplay="block"
                        // eventColor="#aaffaa"
                        headerToolbar={{
                            center: 'title',
                            right: 'prev,next today',
                            // right: 'dayGridMonth,dayGridWeek',
                        }}
                    />
                </Box>
            </Box>
        </>
    );
};
