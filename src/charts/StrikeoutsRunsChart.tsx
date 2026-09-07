import {
    CartesianGrid,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    XAxis,
    YAxis,
    ReferenceLine,
} from 'recharts';

export const StrikeoutsRunsChart = ({ seasonGames }: { seasonGames: any }) => {
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
                        dataKey="strikeoutDifferential"
                        name="strikeoutDifferential"
                        stroke="#ffffff"
                        domain={[-12, 12]}
                        allowDataOverflow={true}
                        ticks={negativeScoreTicks}
                        tickLine={false}
                        label={{
                            value: 'Home Pitching Ks - Away Pitching Ks',
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
                            .filter(
                                (game) =>
                                    game?.liveData?.linescore &&
                                    game?.liveData?.boxscore
                            )
                            .map((game) => ({
                                strikeoutDifferential:
                                    game.liveData.boxscore.teams.home.teamStats
                                        .pitching.strikeOuts -
                                    game.liveData.boxscore.teams.away.teamStats
                                        .pitching.strikeOuts,
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
