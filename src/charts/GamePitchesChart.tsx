import { CartesianGrid, Cell, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';

import { Consts } from '../consts/consts';
import { handleScatterClick } from './chartUtils';
import PitchTooltip from './PitchTooltip';


export default function GamePitchesChart({ selectedPitcherGamePitches }) {

    return <>
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <YAxis
                    type="number"
                    dataKey="yAxisTrack"
                    stroke="#ffffff"
                    domain={[-0.05, 1.05]}
                    tick={false}
                    tickLine={false}
                    name=""
                    show={false}
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
                <Tooltip
                    cursor={{ strokeDasharray: '5 5' }}
                    shared={false}
                    contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '4px' }}
                    itemStyle={{ color: '#fff' }}
                    content={<PitchTooltip />}
                />
                <Scatter
                    data={selectedPitcherGamePitches.map(pitch => ({
                        ...pitch,
                        axisLine: "Velocity",
                        yAxisTrack: Math.random()
                    }))}
                    isAnimationActive={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    onClick={handleScatterClick}
                >
                    {selectedPitcherGamePitches.map((entry, index) => (
                        <Cell
                            key={`pitch-${index}`}
                            fill={Consts.PITCH_COLORS[entry.details?.type?.description] || '#555555'}
                            opacity={0.5}
                        />
                    ))}
                </Scatter>
            </ScatterChart>
        </ResponsiveContainer>
    </>
}

