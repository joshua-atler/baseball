// @ts-nocheck

import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Tooltip, Stack, Chip, CircularProgress, LinearProgress } from '@mui/material';
import { HiExternalLink } from 'react-icons/hi';
import { Circle, CircleOutlined, ArrowDropUp, ArrowDropDown, KeyboardDoubleArrowDown, KeyboardDoubleArrowUp, ArrowForward } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import { Consts } from '../../consts/consts.ts';
import { fetchGame } from '../../services/gamesService.ts';
import { useBasedash } from '../../context/BasedashContext';
import { GameTabContent } from '../../components/GameTabContent.tsx';
import { transformGamePlays } from '../../utils/gameTransformers.ts';
import { PlayerPhoto } from '../../components/PlayerPhoto.tsx';

const strikeZoneWidth = 180;
const strikeZoneHeight = 240;
const strikeZoneSide = 17 / 24;
const sizeMult = 55;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Inning({ inning, theme }) {
    return (
        <Accordion>
            <AccordionSummary
                expandIcon={<KeyboardDoubleArrowDown />}
                sx={{
                    backgroundColor: theme.palette.custom.innings,
                    // borderBottom: '1px solid',
                    // borderColor: 'divider',
                    '&:hover': {
                        backgroundColor: theme.palette.custom.inningsHover,
                    },
                    display: 'flex',
                    "& .MuiAccordionSummary-content": {
                        // justifyContent: "space-between",
                        alignItems: "center"
                    },
                }}
            >
                <img width="50" height="50" className="logo" src={inning.logo} />
                <Typography variant="h5">{inning.inningNum}
                    {
                        inning.half === 'Top' ? <>
                            <ArrowDropUp sx={{ fontSize: 40 }} style={{ verticalAlign: 'middle' }} />
                        </> : <>
                            <ArrowDropDown sx={{ fontSize: 40 }} style={{ verticalAlign: 'middle' }} />
                        </>
                    }
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                </Typography>
                {
                    inning.plays.map((play, i) => {
                        return <Box key={i}>
                            <Play play={play} theme={theme} />
                        </Box>
                    })
                }
            </AccordionDetails>
        </Accordion>
    );
}

function Play({ play, theme }) {
    const result = play?.result?.event;
    const matchup = play?.matchup;

    const starts = play?.playEvents[0]?.offense;
    const ends = structuredClone(starts);

    const nextEnds = { ...ends };
    const mapBaseToKey = (key) => ({ '1B': 'first', '2B': 'second', '3B': 'third' }[key] || key);

    play?.runners.forEach(runner => {
        const start = mapBaseToKey(runner.movement.start);
        if (['first', 'second', 'third'].includes(start)) {
            delete nextEnds[start];
        }
    });

    const pitches = play?.playEvents.filter(p => p.isPitch);

    const finalDestinations = {};

    play?.runners.forEach(runner => {
        const runnerId = runner.details.runner.id;
        const endBase = mapBaseToKey(runner.movement.end);
        const isOut = runner.movement.isOut;

        finalDestinations[runnerId] = { base: endBase, isOut: isOut };
    });

    Object.values(finalDestinations).forEach(dest => {
        if (!dest.isOut && ['first', 'second', 'third'].includes(dest.base)) {
            nextEnds[dest.base] = true;
        }
    });

    return (
        <Accordion variant="outlined">
            <AccordionSummary
                expandIcon={<KeyboardDoubleArrowDown />}
                sx={{
                    backgroundColor: play?.about?.isScoringPlay ? '#008800' : theme.palette.custom.plays,
                    // borderBottom: '1px solid',
                    // borderColor: 'divider',
                    '&:hover': {
                        backgroundColor: play?.about?.isScoringPlay ? '#009900' : theme.palette.custom.playsHover,
                    },
                    // display: 'flex',
                    // "& .MuiAccordionSummary-content": {
                    //     justifyContent: "space-between",
                    //     alignItems: "center"
                    // },
                }}
            >
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                    alignItems: 'center',
                    width: '100%',
                    gap: 1
                }}>
                    <Typography>{result ? result : 'At Bat'}</Typography>
                    <Stack direction="row">
                        {Array.from({ length: 3 - play?.count?.outs }).map((_, i) => {
                            return <CircleOutlined key={`empty-${i}`} sx={{ verticalAlign: 'middle', fontSize: 20 }} />
                        })}
                        {Array.from({ length: play?.count?.outs }).map((_, i) => {
                            return <Circle key={`filled-${i}`} sx={{ verticalAlign: 'middle', fontSize: 20 }} />
                        })}
                    </Stack>
                    <Stack direction="row">
                        <Baserunners runners={starts} theme={theme} />
                        <ArrowForward />
                        <Baserunners runners={nextEnds} theme={theme} />
                    </Stack>
                    <Typography>{matchup?.batter?.fullName}</Typography>
                    <PlayerPhoto playerID={matchup?.batter?.id} width={100} height={100} />
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Typography>
                    {play?.result?.description}
                </Typography>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 3fr',
                    gap: 2,
                    mt: 2,
                    padding: 5,
                    backgroundColor: theme.palette.custom.dark
                }}>
                    <StrikeZone pitches={pitches} />
                    <Stack direction="column" gap={2}>
                        {play?.playEvents?.map((playEvent, i) => {
                            return <PlayEvent key={i} playEvent={playEvent} theme={theme} />
                        })}
                    </Stack>
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}

function Baserunners({ runners = {}, theme }) {

    const baseData = [[theme.palette.custom.basesIconEmptyFill, theme.palette.custom.basesIconEmptyEdge], [theme.palette.custom.basesIconEmptyFill, theme.palette.custom.basesIconEmptyEdge], [theme.palette.custom.basesIconEmptyFill, theme.palette.custom.basesIconEmptyEdge]];
    if (runners.first) {
        baseData[2][0] = theme.palette.custom.basesIconRunner;
        baseData[2][1] = theme.palette.custom.basesIconRunner;
    }
    if (runners.second) {
        baseData[1][0] = theme.palette.custom.basesIconRunner;
        baseData[1][1] = theme.palette.custom.basesIconRunner;
    }
    if (runners.third) {
        baseData[0][0] = theme.palette.custom.basesIconRunner;
        baseData[0][1] = theme.palette.custom.basesIconRunner;
    }

    return <svg className="svg" width="35" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16.25" aria-label="base">
        <rect fill={baseData[0][0]} strokeWidth="1" stroke={baseData[0][1]} width="6" height="6" transform="translate(5, 7.25) rotate(-315)" rx="1px" ry="1px"></rect>
        <rect fill={baseData[1][0]} strokeWidth="1" stroke={baseData[1][1]} width="6" height="6" transform="translate(12, 0.5) rotate(-315)" rx="1px" ry="1px"></rect>
        <rect fill={baseData[2][0]} strokeWidth="1" stroke={baseData[2][1]} width="6" height="6" transform="translate(19, 7.25) rotate(-315)" rx="1px" ry="1px"></rect>
    </svg>;
}

function PlayIcon({ desc }) {
    let pathData = '';
    if (desc !== undefined) {
        if (desc.includes('steals')) {
            pathData = Consts.pitchIcons['steals'];
        } else if (desc.includes('error')) {
            pathData = Consts.pitchIcons['error'];
        } else if (desc.includes('replaces') || desc.includes('switch')) {
            pathData = Consts.pitchIcons['switch'];
        } else if (desc.includes('Visit') || desc.includes('Timeout') || desc.includes('Step Off')) {
            pathData = Consts.pitchIcons['pause'];
        } else if (desc.includes('Status Change')) {
            pathData = Consts.pitchIcons['status'];
        } else if (desc.includes('caught') || desc.includes('Automatic')) {
            pathData = Consts.pitchIcons['caught'];
        } else if (desc.includes('remains')) {
            pathData = Consts.pitchIcons['remains'];
        } else if (desc.includes('Pickoff Attempt') || desc.includes('picks off') || desc.includes('Wild pitch') || desc.includes('Passed ball') || desc.includes('Delay')) {
            pathData = Consts.pitchIcons['warning'];
        } else if (desc.includes('Timer Violation')) {
            pathData = Consts.pitchIcons['timer'];
        }
    }

    if (pathData === '') {
        return null;
    }

    return <svg height="20px" width="20px" viewBox="0 -960 960 960">
        <path d={pathData} fill="#ffffff" />
    </svg>;
}

function PlayEvent({ playEvent, theme }) {
    const callDescription = playEvent?.details?.call?.description;
    const description = playEvent?.details?.type?.description;
    const count = `${playEvent?.count?.balls}-${playEvent?.count?.strikes}`;

    return (
        <>
            {
                playEvent?.isPitch ? <>
                    <Box>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}>
                            <svg width="20" height="20" viewBox="0 0 20 20">
                                <BallIcon pitch={playEvent} pitchX={10} pitchY={10} ballNum={playEvent?.pitchNumber} />
                            </svg>
                            <Typography sx={{ fontWeight: 'bold' }}>
                                {callDescription}
                            </Typography>
                            <a target="_blank" rel="noopener noreferrer" href={`https://baseballsavant.mlb.com/sporty-videos?playId=${playEvent?.playId}`}>
                                <HiExternalLink style={{ verticalAlign: 'middle' }} size={20} />
                            </a>
                        </Box>
                        <Typography>{count}</Typography>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}>
                            <Typography>{description}</Typography>
                            <Typography>{playEvent?.pitchData?.startSpeed}</Typography>
                        </Box>
                    </Box>
                </> : <>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: 2
                    }}>
                        <Box sx={{ flexShrink: 0, width: 20, height: 20 }}>
                            <PlayIcon desc={playEvent?.details?.description} />
                        </Box>
                        <Typography>{playEvent?.details?.description}</Typography>
                    </Box>
                </>
            }
        </>
    );
}

function StrikeZone({ pitches }) {

    const strikeZoneTop = pitches[0]?.pitchData?.strikeZoneTop;
    const strikeZoneBottom = pitches[0]?.pitchData?.strikeZoneBottom;

    const strikeZoneVertSize = strikeZoneTop - strikeZoneBottom;
    const strikeZoneCanvasLeft = (strikeZoneWidth / 2) - strikeZoneSide * sizeMult;
    const strikeZoneCanvasRight = (strikeZoneWidth / 2) + strikeZoneSide * sizeMult;
    const strikeZoneCanvasTop = (strikeZoneHeight / 2) - strikeZoneVertSize / 2 * sizeMult;
    const strikeZoneCanvasBottom = (strikeZoneHeight / 2) + strikeZoneVertSize / 2 * sizeMult;

    return (
        <svg width={strikeZoneWidth} height={strikeZoneHeight} viewBox={`0 0 ${strikeZoneWidth} ${strikeZoneHeight}`} style={{ border: '1px solid #ffffff' }}>
            <line x1={strikeZoneCanvasLeft} y1={strikeZoneCanvasBottom} x2={strikeZoneCanvasLeft} y2={strikeZoneCanvasTop} stroke='#cccccc' strokeWidth="2" />
            <line x1={strikeZoneCanvasRight} y1={strikeZoneCanvasBottom} x2={strikeZoneCanvasRight} y2={strikeZoneCanvasTop} stroke='#cccccc' strokeWidth="2" />
            <line x1={strikeZoneCanvasLeft} y1={strikeZoneCanvasTop} x2={strikeZoneCanvasRight} y2={strikeZoneCanvasTop} stroke='#cccccc' strokeWidth="2" />
            <line x1={strikeZoneCanvasLeft} y1={strikeZoneCanvasBottom} x2={strikeZoneCanvasRight} y2={strikeZoneCanvasBottom} stroke='#cccccc' strokeWidth="2" />

            {pitches.map((pitch, i) => {
                const rawPitchX = Math.round(pitch?.pitchData?.coordinates?.pX * 1000) / 1000;
                const rawPitchY = Math.round(pitch?.pitchData?.coordinates?.pZ * 1000) / 1000;

                const topY = (strikeZoneHeight / 2) - (strikeZoneVertSize / 2) * sizeMult;
                const bottomY = (strikeZoneHeight / 2) + (strikeZoneVertSize / 2) * sizeMult;
                const percentFromBottomY = (rawPitchY - strikeZoneBottom) / strikeZoneVertSize;

                const pitchX = (strikeZoneWidth / 2) + rawPitchX * sizeMult;
                const pitchY = bottomY - (percentFromBottomY * (bottomY - topY));

                return <BallIcon key={i} pitch={pitch} pitchX={pitchX} pitchY={pitchY} ballNum={i + 1} />
            })}
        </svg>
    )
};

function BallIcon({ pitch, pitchX, pitchY, ballNum }) {
    return <g style={{ cursor: 'pointer' }} >
        <circle
            cx={pitchX}
            cy={pitchY}
            r="8"
            fill={pitch?.details?.ballColor}
            stroke={'#000000'}
            strokeWidth={2}
        />
        <text
            x={pitchX}
            y={pitchY}
            fill="white"
            fontSize="14"
            textAnchor="middle"
            dominantBaseline="central"
        >
            {ballNum}
        </text>
    </g>
}

export default function Plays({ }) {

    const theme = useTheme();
    const { selectedGame } = useBasedash();
    const [innings, setInnings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getPlays = async () => {
            if (!selectedGame) {
                setInnings([]);
                return;
            };

            setIsLoading(true);
            try {
                const inningsContent = await fetchGame(selectedGame, ['credits', 'alignment', 'flags']);
                const formattedPlays = transformGamePlays(inningsContent);
                setInnings(formattedPlays);
            } catch (error) {
                setInnings([]);
                console.error("Team stats fetch failed: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        getPlays();
    }, [selectedGame]);

    return (
        <GameTabContent>
            {
                isLoading ? <>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            border: '5px solid rgba(255, 255, 255, 0.1)',
                            borderTop: (theme) => `5px solid ${theme.palette.custom.highlightGreen}`,
                            animation: 'spin 1s linear infinite',
                            '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' },
                            },
                        }}
                    />
                </> : innings.length !== 0 ?
                    <>
                        {
                            innings.map((inning, i) => {
                                return <Box key={i}>
                                    <Inning inning={inning} theme={theme} />
                                </Box>
                            })
                        }
                    </>
                    :
                    <>
                        <Typography variant="h3">No Plays</Typography>
                    </>
            }
        </GameTabContent>
    )
}