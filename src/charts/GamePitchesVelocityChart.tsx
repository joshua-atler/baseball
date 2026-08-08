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

export const GamePitchesVelocityChart = ({
    selectedPitcherGamePitchesVelocity,
}: {
    selectedPitcherGamePitchesVelocity: any;
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
                        dataKey="pitchTime"
                        stroke="#ffffff"
                        domain={[
                            (dataMin) => dataMin - 5 * 60 * 1000,
                            (dataMax) => dataMax + 5 * 60 * 1000,
                        ]}
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(ms) => {
                            return new Date(ms).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            });
                        }}
                    />
                    <YAxis
                        type="number"
                        dataKey="velocity"
                        unit="MPH"
                        stroke="#ffffff"
                        domain={['dataMin - 5', 'dataMax + 5']}
                        // tick={false}
                        fontSize={12}
                        tickLine={false}
                        // show={false}
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
                        data={selectedPitcherGamePitchesVelocity.map(
                            (pitch: any) => ({
                                ...pitch,
                            })
                        )}
                        isAnimationActive={false}
                        onClick={handleScatterClick}
                    >
                        {selectedPitcherGamePitchesVelocity.map(
                            (entry: any, index: number) => {
                                const pitchDescription = entry.details?.type
                                    ?.description as keyof typeof Consts.PITCH_COLORS;
                                return (
                                    <Cell
                                        key={`pitch-${index}`}
                                        fill={
                                            Consts.PITCH_COLORS[
                                                pitchDescription
                                            ] || '#555555'
                                        }
                                        opacity={0.5}
                                    />
                                );
                            }
                        )}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </>
    );
};
