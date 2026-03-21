import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { DUBLIN_CENTER } from "../../config/constants.js";
import Legend from "./components/Legend.jsx";
import { useEffect, useState } from "react";
import { fetchStaticStations } from "../../api/stationService.js";

function getMarkerColor(availableBikes) {
    if (availableBikes <= 0) return '#ef4444';
    if (availableBikes <= 5) return '#eab308';
    return '#22c55e';
}

function MarkerBadge({ station, isSelected }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
                style={{
                    backgroundColor: getMarkerColor(station.available_bikes),
                    color: 'white',
                    width: isSelected ? '54px' : '46px',
                    height: isSelected ? '54px' : '46px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isSelected ? '24px' : '20px',
                    border: isSelected ? '4px solid #d19a00' : '3px solid white',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                }}
            >
                🚲
            </div>
            <div
                style={{
                    marginTop: '6px',
                    backgroundColor: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                    fontWeight: 700,
                    fontSize: '14px'
                }}
            >
                {station.available_bikes}
            </div>
        </div>
    );
}

export default function MapView({ selectedStation, onSelectStation }) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    const [stations, setStations] = useState([]);

    useEffect(() => {
        const loadStations = async () => {
            try {
                const stationData = await fetchStaticStations();
                setStations(stationData.data || []);
            } catch (error) {
                console.error(error);
            }
        };
        loadStations();
    }, []);

    if (!apiKey) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'red' }}>
                <div>
                    <h2>Error: Google Maps API Key is missing.</h2>
                    <p>Please check your .env file and restart the server.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', flex: 1, position: 'relative' }}>
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={DUBLIN_CENTER}
                    defaultZoom={13}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    zoomControl={false}
                    mapId={"DEMO_MAP_ID"}
                >
                    {stations.map((station) => (
                        <AdvancedMarker
                            key={station.number}
                            position={{
                                lat: station.position_lat,
                                lng: station.position_lng
                            }}
                            title={station.name}
                            onClick={() => onSelectStation(station)}
                        >
                            <MarkerBadge
                                station={station}
                                isSelected={selectedStation?.number === station.number}
                            />
                        </AdvancedMarker>
                    ))}
                </Map>
            </APIProvider>

            <Legend />
        </div>
    );
}