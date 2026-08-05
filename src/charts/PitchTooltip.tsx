export const PitchTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const pitch = payload[0].payload;

        return (
            <div
                style={{
                    backgroundColor: '#222',
                    border: '1px solid #444',
                    padding: '10px',
                    borderRadius: '6px',
                    boxShadow: '0px 4px 10px rgba(0,0,0,0.5)',
                }}
            >
                <p
                    style={{
                        margin: 0,
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '14px',
                    }}
                >
                    {/* {pitch.pitchType} */}
                    {pitch.details.type.description}
                </p>
                <p
                    style={{
                        margin: '4px 0 0 0',
                        color: '#aaa',
                        fontSize: '12px',
                    }}
                >
                    Velocity:{' '}
                    <span style={{ color: '#fff', fontWeight: '600' }}>
                        {pitch.pitchData.startSpeed} MPH
                    </span>
                </p>
            </div>
        );
    }
    return null;
};
