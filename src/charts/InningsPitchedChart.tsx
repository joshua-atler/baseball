import { useTheme } from '@mui/material/styles';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import { SeasonInningsPitched } from '../types/player';

export const InningsPitchedChart = ({
    seasonInningsPitched,
}: {
    seasonInningsPitched: SeasonInningsPitched[];
}) => {
    const theme = useTheme();

    const maxInningsValue = Math.max(
        ...seasonInningsPitched.map((x) => Number(x.inningsPitched)),
        5
    );
    const seasonsPitchedYAxisTicks = Array.from(
        { length: Math.ceil(maxInningsValue) + 1 },
        (_, i) => i * 1
    );

    return (
        <>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={seasonInningsPitched}
                    margin={{ top: 20, right: 0, left: 20, bottom: 45 }}
                >
                    <CartesianGrid stroke="#ffffff" />
                    <XAxis
                        dataKey="inningNum"
                        stroke="#ffffff"
                        fontSize={20}
                        label={{
                            value: 'Inning Number',
                            position: 'insideBottom',
                            offset: -20,
                            fill: '#ffffff',
                            fontSize: 20,
                        }}
                    />
                    <YAxis
                        stroke="#ffffff"
                        fontSize={20}
                        ticks={seasonsPitchedYAxisTicks}
                        label={{
                            value: 'Innings',
                            angle: -90,
                            position: 'insideLeft',
                            offset: 0,
                            fill: '#ffffff',
                            fontSize: 20,
                        }}
                    />
                    <Bar
                        dataKey="inningsPitched"
                        radius={[10, 10, 0, 0]}
                        fill={theme.palette.custom.highlightGreen}
                    ></Bar>
                </BarChart>
            </ResponsiveContainer>
        </>
    );
};
