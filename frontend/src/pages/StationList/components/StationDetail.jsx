// src/pages/StationList/components/StationDetail.jsx
export default function StationDetail({ station, onClose ,onMoreInfoClick}) {
    if (!station) return null;

    const totalCapacity = station.bike_stands ?? '—';
    const bikes = station.available_bikes ?? 0;
    const docks = station.available_bike_stands ?? 0;
    const occupancy = station.bike_stands
        ? Math.round((bikes / station.bike_stands) * 100)
        : null;

    const handleDirections = () => {
        const lat = station.position?.lat;
        const lng = station.position?.lng;
        if (lat && lng) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                '_blank'
            );
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a', lineHeight: 1.3, flex: 1 }}>
                    {station.name}
                </h2>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none', border: 'none', fontSize: '20px',
                        cursor: 'pointer', color: '#666', marginLeft: '8px', lineHeight: 1,
                    }}
                >×</button>
            </div>

            <hr style={{ marginBottom: '16px', borderColor: '#eee' }} />

            {/* Bikes / Docks cards */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                    flex: 1, background: '#f0fdf4', borderRadius: '10px',
                    padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '0.8rem', fontWeight: 600 }}>
                        🚲 Bikes
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#15803d', lineHeight: 1 }}>
                        {bikes}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>available</div>
                </div>

                <div style={{
                    flex: 1, background: '#eff6ff', borderRadius: '10px',
                    padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8', fontSize: '0.8rem', fontWeight: 600 }}>
                        📍 Docks
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1d4ed8', lineHeight: 1 }}>
                        {docks}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>available</div>
                </div>
            </div>

            {/* Get Directions button */}
            <button
                onClick={handleDirections}
                style={{
                    width: '100%', padding: '12px', marginBottom: '10px',
                    backgroundColor: '#1a73e8', color: 'white',
                    border: 'none', borderRadius: '8px',
                    fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
            >
                ➤ Get Directions
            </button>

            {/* More Information */}
            <button
                onClick={() => onMoreInfoClick?.()}
                style={{
                    width: '100%', padding: '12px', marginBottom: '20px',
                    backgroundColor: '#16a34a', color: 'white',
                    border: 'none', borderRadius: '8px',
                    fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', opacity: 1,
                }}
            >
                ⓘ More Information
            </button>

            <hr style={{ marginBottom: '16px', borderColor: '#eee' }} />

            {/* Quick Stats */}
            <div>
                <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '12px' }}>Quick Stats</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#555' }}>Total Capacity:</span>
                        <strong>{totalCapacity} bikes</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#555' }}>Occupancy:</span>
                        <strong>{occupancy !== null ? `${occupancy}%` : '—'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#555' }}>Status:</span>
                        <strong style={{ color: station.status === 'OPEN' ? '#16a34a' : '#dc2626' }}>
                            {station.status ?? '—'}
                        </strong>
                    </div>
                </div>
            </div>
        </div>
    );
}