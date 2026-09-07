import {
    CartesianGrid,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    XAxis,
    YAxis,
} from 'recharts';

export const AwayHomeScoreChart = ({ seasonGames }: { seasonGames: any }) => {
    const scoreTicks = Array.from({ length: 11 }, (_, i) => i * 2);

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
                        dataKey="homeScore"
                        name="Home Score"
                        stroke="#ffffff"
                        domain={[0, 20]}
                        allowDataOverflow={true}
                        ticks={scoreTicks}
                        tickLine={false}
                        label={{
                            value: 'Home Score (Runs)',
                            position: 'insideBottom',
                            offset: -20,
                            fill: '#ffffff',
                        }}
                    />

                    <YAxis
                        type="number"
                        dataKey="awayScore"
                        name="Away Score"
                        stroke="#ffffff"
                        domain={[0, 20]}
                        allowDataOverflow={true}
                        ticks={scoreTicks}
                        tickLine={false}
                        label={{
                            value: 'Away Score (Runs)',
                            angle: -90,
                            position: 'insideLeft',
                            offset: -35,
                            fill: '#ffffff',
                        }}
                    />
                    <Scatter
                        data={seasonGames
                            .filter((game) => game?.liveData?.linescore)
                            .map((game) => ({
                                homeScore:
                                    game.liveData.linescore.teams.home.runs ??
                                    0,
                                awayScore:
                                    game.liveData.linescore.teams.away.runs ??
                                    0,
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
