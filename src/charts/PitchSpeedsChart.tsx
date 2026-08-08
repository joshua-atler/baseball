import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { PitchSpeeds } from '../types/player.ts';

import { Consts } from '../consts/consts.ts';

export const PitchSpeedsChart = ({ pitchSpeeds }: {
    pitchSpeeds: PitchSpeeds[]
}) => {

    return (
        <>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart responsive data={pitchSpeeds}>
                    <CartesianGrid stroke="#ffffff" />
                    <XAxis dataKey="pitchType" stroke="#ffffff" fontSize={14} />
                    <YAxis
                        stroke="#ffffff"
                        domain={[60, 'auto']}
                        fontSize={20}
                    />
                    <Tooltip
                        formatter={(value) => [`${value} MPH average`]}
                        contentStyle={{
                            backgroundColor: '#222',
                            borderColor: '#444',
                            borderRadius: '4px',
                        }}
                        itemStyle={{ color: '#ffffff' }}
                    />
                    <Bar dataKey="speed" radius={[10, 10, 0, 0]}>
                        {pitchSpeeds.map((pitch, index) => {
                            return (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        Consts.PITCH_COLORS[pitch.pitchType] !==
                                        undefined
                                            ? Consts.PITCH_COLORS[
                                                  pitch.pitchType
                                              ]
                                            : 'rgba(150, 150, 150, 0.8)'
                                    }
                                />
                            );
                        })}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </>
    );
};
