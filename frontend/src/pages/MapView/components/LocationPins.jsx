import { AdvancedMarker } from '@vis.gl/react-google-maps';

function Pin({ label, color }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: 'translateY(-8px)',
            }}
        >
            <div
                style={{
                    minWidth: '28px',
                    height: '28px',
                    padding: '0 8px',
                    borderRadius: '999px',
                    backgroundColor: color,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    border: '2px solid #fff',
                }}
            >
                {label}
            </div>

            <div
                style={{
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: `12px solid ${color}`,
                    marginTop: '-2px',
                    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
                }}
            />
        </div>
    );
}

export default function LocationPins({ userLocation, destinationLocation }) {
    return (
        <>
            {userLocation && (
                <AdvancedMarker
                    position={{
                        lat: userLocation.lat,
                        lng: userLocation.lng,
                    }}
                    zIndex={200}
                >
                    <Pin label="You" color="#2563eb" />
                </AdvancedMarker>
            )}

            {destinationLocation && (
                <AdvancedMarker
                    position={{
                        lat: destinationLocation.lat,
                        lng: destinationLocation.lng,
                    }}
                    zIndex={210}
                >
                    <Pin label="Destination" color="#ef4444" />
                </AdvancedMarker>
            )}
        </>
    );
}