import { Box, Typography } from '@mui/material';
import DT from 'datatables.net-dt';
import DataTable from 'datatables.net-react';

import { Consts } from '../../consts/consts';

// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DT);

export const HitterStatsView = ({
    hitterStats,
    displayedHitterStats,
    hitterStatsColumns,
}: any) => {
    return (
        <>
            <Typography variant="h6">Hitter stats</Typography>
            {hitterStats && (
                <Box sx={Consts.dataTableContainerSx}>
                    <DataTable
                        data={displayedHitterStats}
                        columns={hitterStatsColumns}
                        options={{
                            select: {
                                info: false,
                            },
                            paging: false,
                            info: false,
                            ordering: false,
                            dom: 't',
                            destroy: true,
                        }}
                        // onSelect={handlePitcherRowSelect}
                        // onDeselect={handlePitcherRowDeselect}
                    />
                </Box>
            )}
            {/* {pitcherYearDetails.isLoading && <>
                <LoadingCircle size={60} />
            </>}
            {pitcherYearDetails.year &&
                <Typography variant='h4'>{pitcherYearDetails.year}</Typography>
            }
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                {pitcherYearDetails.pitchArsenal &&
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '600px' }}>
                        <Typography variant='h5'>Pitch Arsenal (Total: {totalPitches})</Typography>
                        <PitchArsenalChart pitchArsenal={pitcherYearDetails.pitchArsenal} />
                    </Box>
                }
                {pitcherYearDetails.pitchSpeeds &&
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '600px' }}>
                        <Typography variant='h5'>Pitch Speeds</Typography>
                        <PitchSpeedsChart pitchSpeeds={pitcherYearDetails.pitchSpeeds} />
                    </Box>
                }
            </Box>
            {allSeasonPitches &&
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '1200px' }}>
                    <Typography variant='h5'>All Pitches</Typography>
                    <AllSeasonPitchesChart allSeasonPitches={allSeasonPitches} />
                </Box>
            }
            {seasonInningsPitched.length > 0 &&
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '1200px' }}>
                    <Typography variant='h5'>Innings Pitched</Typography>
                    <InningsPitchedChart seasonInningsPitched={seasonInningsPitched} />
                </Box>
            }
            {pitcherYearDetails.gameLog && <Box sx={Consts.dataTableContainerSx}>
                <Typography variant='h5'>Game Log</Typography>
                <DataTable
                    data={pitcherYearDetails.gameLog}
                    columns={pitcherGameLogColumns}
                    options={{
                        select: {
                            info: false
                        },
                        paging: false,
                        info: false,
                        ordering: false,
                        dom: "t",
                        destroy: true,
                    }}
                    onSelect={handlePitcherGameRowSelect}
                    onDeselect={handlePitcherGameRowDeselect}
                />
            </Box>
            }
            {selectedPitcherGamePitches &&
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '1200px' }}>
                    <Typography variant='h5'>Game Pitches</Typography>
                    <GamePitchesChart selectedPitcherGamePitches={selectedPitcherGamePitches} />
                </Box>
            }
            {selectedPitcherGamePitchesVelocity &&
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '600px', width: '1200px' }}>
                    <Typography variant='h5'>Game Pitches Velocity</Typography>
                    <GamePitchesVelocityChart selectedPitcherGamePitchesVelocity={selectedPitcherGamePitchesVelocity} />
                </Box>
            } */}
        </>
    );
};
