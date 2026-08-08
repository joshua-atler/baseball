import {
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { Consts } from '../consts/consts';
import { handleScatterClick } from './chartUtils';
import { PitchTooltip } from './PitchTooltip';

export const AllSeasonPitchesChart = ({
    allSeasonPitches,
}: {
    allSeasonPitches: any;
}) => {
    return (
        <>
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#333"
                    />
                    <XAxis
                        type="number"
                        dataKey="pitchData.startSpeed"
                        name="Velocity"
                        unit="MPH"
                        stroke="#ffffff"
                        domain={['dataMin - 2', 'dataMax + 2']}
                        fontSize={12}
                        tickLine={false}
                    />
                    <YAxis
                        type="number"
                        dataKey="yAxisTrack"
                        stroke="#ffffff"
                        domain={[-0.05, 1.05]}
                        tick={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ strokeDasharray: '5 5' }}
                        shared={false}
                        contentStyle={{
                            backgroundColor: '#222',
                            borderColor: '#444',
                            borderRadius: '4px',
                        }}
                        itemStyle={{ color: '#fff' }}
                        // @ts-expect-error
                        content={<PitchTooltip />}
                    />
                    <Scatter
                        data={allSeasonPitches.map((pitch: any) => ({
                            ...pitch,
                            axisLine: 'Velocity',
                            yAxisTrack: Math.random(),
                        }))}
                        isAnimationActive={false}
                        onClick={handleScatterClick}
                    >
                        {allSeasonPitches.map((entry: any, index: number) => {
                            const pitchDescription = entry.details?.type
                                ?.description as keyof typeof Consts.PITCH_COLORS;
                            return (
                                <Cell
                                    key={`pitch-${index}`}
                                    fill={
                                        Consts.PITCH_COLORS[pitchDescription] ||
                                        '#555555'
                                    }
                                    opacity={0.5}
                                />
                            );
                        })}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </>
    );
};
