//src/pages/StationList/components/NearestStationsList.jsx

export default function NearestStationsList({
    stations,
    userLocation,
    locationError,
    onSelectStation
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
                <h2
                    style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#1a1a1a'
                    }}
                >
                    Nearby Stations
                </h2>

                <p
                    style={{
                        margin: '4px 0 0',
                        color: '#666',
                        fontSize: '0.8rem'
                    }}
                >
                    {userLocation
                        ? 'Showing the 3 nearest stations to your location'
                        : 'Locating you...'}
                </p>
            </div>

            {locationError && (
                <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>
                    {locationError}
                </div>
            )}

            {!userLocation && !locationError && (
                <div style={{ color: '#666', fontSize: '0.85rem' }}>
                    Waiting for location permission...
                </div>
            )}

            {userLocation && stations.length === 0 && (
                <div style={{ color: '#666', fontSize: '0.85rem' }}>
                    No nearby stations found.
                </div>
            )}

            {stations.map((station) => {
                const bikes = station.available_bikes ?? 0;
                const docks = station.available_bike_stands ?? 0;
                const distance = station.distanceKm?.toFixed(2);

                return (
                    <button
                        key={station.number}
                        onClick={() => onSelectStation?.(station)}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            background: '#fff',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: '#111827',
                                marginBottom: '6px',
                                lineHeight: 1.25
                            }}
                        >
                            {station.name}
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.78rem',
                                color: '#4b5563',
                                marginBottom: '4px'
                            }}
                        >
                            <span>🚲 Bikes: {bikes}</span>
                            <span>📍 Docks: {docks}</span>
                        </div>

                        <div style={{ fontSize: '0.76rem', color: '#6b7280' }}>
                            Distance: {distance} km
                        </div>
                    </button>
                );
            })}
        </div>
    );
}