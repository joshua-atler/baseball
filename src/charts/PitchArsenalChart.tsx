import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

import { Consts } from '../consts/consts.ts';

export default function PitchArsenalChart({ pitchArsenal }) {
    return (
        <>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart
                    responsive
                    style={{ width: '600px', height: '600px' }}
                >
                    <Pie
                        data={pitchArsenal}
                        dataKey="count"
                        nameKey="pitchType"
                        cx="50%"
                        cy="50%"
                        outerRadius={200}
                        label={({
                            x,
                            y,
                            name,
                            textAnchor,
                            dominantBaseline,
                        }) => (
                            <text
                                x={x}
                                y={y}
                                fill="#ffffff"
                                fontSize="20px"
                                textAnchor={textAnchor}
                                dominantBaseline={dominantBaseline}
                            >
                                {name}
                            </text>
                        )}
                        labelLine={false}
                    >
                        {pitchArsenal.map((pitch, index) => {
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
                    </Pie>
                    <Tooltip />
                    <Legend
                        iconSize={30}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </>
    );
}
