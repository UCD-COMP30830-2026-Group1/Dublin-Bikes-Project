function getStatusColor(station) {
    if (!station || station.available_bikes <= 0) return '#ef4444';
    if (station.available_bikes <= 5) return '#eab308';
    return '#22c55e';
}

export default function StationList({ station, onClose, onOpenDetails }) {
    if (!station) return null;

    const occupancy = Math.round((station.available_bikes / station.bike_stands) * 100);
    const statusText = station.available_bikes === 0 ? 'Empty' : station.available_bikes <= 5 ? 'Low' : 'Available';

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            <div
                style={{
                    padding: '20px',
                    backgroundColor: '#e8f1ea',
                    borderBottom: '1px solid #d9e2dc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <h2 style={{ margin: 0, fontSize: '20px' }}>{station.name}</h2>
                <button
                    onClick={onClose}
                    style={{ border: 'none', background: 'transparent', fontSize: '28px', cursor: 'pointer', color: '#6b7280' }}
                >
                    ×
                </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ border: '1px solid #b8e3c8', backgroundColor: '#eef8f0', borderRadius: '14px', padding: '18px' }}>
                        <div style={{ color: '#4b5563', marginBottom: '10px' }}>🚲 Bikes</div>
                        <div style={{ fontSize: '40px', fontWeight: 700, color: '#0f8a36' }}>{station.available_bikes}</div>
                        <div style={{ color: '#6b7280' }}>available</div>
                    </div>

                    <div style={{ border: '1px solid #c7d7fb', backgroundColor: '#eef4ff', borderRadius: '14px', padding: '18px' }}>
                        <div style={{ color: '#4b5563', marginBottom: '10px' }}>📍 Docks</div>
                        <div style={{ fontSize: '40px', fontWeight: 700, color: '#2563eb' }}>{station.available_bike_stands}</div>
                        <div style={{ color: '#6b7280' }}>available</div>
                    </div>
                </div>

                <button
                    style={{
                        border: 'none',
                        borderRadius: '12px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '16px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    ✈ Get Directions
                </button>

                <button
                    onClick={onOpenDetails}
                    style={{
                        border: 'none',
                        borderRadius: '12px',
                        backgroundColor: '#0aae3f',
                        color: 'white',
                        padding: '16px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    ⓘ More Information
                </button>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '18px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Quick Stats</h3>

                    <div style={{ display: 'grid', gap: '12px', color: '#4b5563' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total Capacity:</span>
                            <strong style={{ color: '#111827' }}>{station.bike_stands} bikes</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Occupancy:</span>
                            <strong style={{ color: '#111827' }}>{occupancy}%</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Status:</span>
                            <strong style={{ color: getStatusColor(station) }}>{statusText}</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Address:</span>
                            <strong style={{ color: '#111827', textAlign: 'right', maxWidth: '140px' }}>{station.address}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}