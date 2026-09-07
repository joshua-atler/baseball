import {
    CartesianGrid,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    XAxis,
    YAxis,
    ReferenceLine,
} from 'recharts';

export const PitchesWalksChart = ({ seasonGames }: { seasonGames: any }) => {
    // Ticks for Walks (0 to 12)
    const walkTicks = Array.from({ length: 7 }, (_, i) => i * 2);
    // Ticks for Pitch Counts (80 to 200)
    const pitchTicks = [80, 100, 120, 140, 160, 180, 200];

    return (
        <ResponsiveContainer width="100%" height={500}>
            <ScatterChart
                margin={{
                    top: 20,
                    right: 30,
                    bottom: 40,
                    left: 50,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />

                <XAxis
                    type="number"
                    dataKey="walks"
                    name="Walks"
                    stroke="#ffffff"
                    domain={[0, 12]}
                    allowDataOverflow={true}
                    ticks={walkTicks}
                    tickLine={false}
                    label={{
                        value: 'Walks',
                        position: 'insideBottom',
                        offset: -20,
                        fill: '#ffffff',
                    }}
                />
                <YAxis
                    type="number"
                    dataKey="totalPitches"
                    name="Total Pitches"
                    stroke="#ffffff"
                    domain={[80, 200]}
                    allowDataOverflow={true}
                    ticks={pitchTicks}
                    tickLine={false}
                    label={{
                        value: 'Total Pitches Thrown',
                        angle: -90,
                        position: 'insideLeft',
                        offset: -35,
                        fill: '#ffffff',
                    }}
                />
                <Scatter
                    data={seasonGames
                        ?.filter((game: any) => game?.liveData?.boxscore)
                        .flatMap((game: any) => {
                            const homeBox =
                                game.liveData.boxscore.teams?.home?.teamStats
                                    ?.pitching;
                            const awayBox =
                                game.liveData.boxscore.teams?.away?.teamStats
                                    ?.pitching;

                            return [
                                {
                                    walks: homeBox?.baseOnBalls,
                                    totalPitches: homeBox?.numberOfPitches,
                                    gamePk: `${game.gamePk}-home`,
                                },
                                {
                                    walks: awayBox?.baseOnBalls,
                                    totalPitches: awayBox?.numberOfPitches,
                                    gamePk: `${game.gamePk}-away`,
                                },
                            ];
                        })}
                    fill="#60a5fa"
                    opacity={0.35}
                />
            </ScatterChart>
        </ResponsiveContainer>
    );
};
