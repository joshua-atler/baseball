import {
    CartesianGrid,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    XAxis,
    YAxis,
    ReferenceLine,
} from 'recharts';

export const HitsRunsChart = ({ seasonGames }: { seasonGames: any }) => {
    const negativeScoreTicks = Array.from({ length: 13 }, (_, i) => i * 2 - 12);

    return (
        <>
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
                        dataKey="hitDifferential"
                        name="hitDifferential"
                        stroke="#ffffff"
                        domain={[-12, 12]}
                        allowDataOverflow={true}
                        ticks={negativeScoreTicks}
                        tickLine={false}
                        label={{
                            value: 'Home Hits - Away Hits',
                            position: 'insideBottom',
                            offset: -20,
                            fill: '#ffffff',
                        }}
                    />

                    <YAxis
                        type="number"
                        dataKey="runDifferential"
                        name="runDifferential"
                        stroke="#ffffff"
                        domain={[-12, 12]}
                        allowDataOverflow={true}
                        ticks={negativeScoreTicks}
                        tickLine={false}
                        label={{
                            value: 'Home Runs - Away Runs',
                            angle: -90,
                            position: 'insideLeft',
                            offset: -35,
                            fill: '#ffffff',
                        }}
                    />
                    <ReferenceLine x={0} stroke="#666" strokeDasharray="3 3" />
                    <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                    <Scatter
                        data={seasonGames
                            .filter((game) => game?.liveData?.linescore)
                            .map((game) => ({
                                hitDifferential:
                                    game.liveData.linescore.teams.home.hits -
                                    game.liveData.linescore.teams.away.hits,
                                runDifferential:
                                    game.liveData.linescore.teams.home.runs -
                                    game.liveData.linescore.teams.away.runs,
                                gamePk: game.gamePk,
                            }))}
                        fill="#60a5fa"
                        opacity={0.35}
                    />
                </ScatterChart>
            </ResponsiveContainer>
        </>
    );
};
