// src/pages/MapView/index.jsx
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { DUBLIN_CENTER } from "../../config/constants.js";
import Legend from "./components/Legend.jsx";
import StationMarkers from "./components/StationMarkers.jsx";
import { useEffect, useState } from "react";
import { fetchLiveStations } from "../../api/stationService.js";

export default function MapView() {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);

    useEffect(() => {
        const loadStations = async () => {
            try {
                const response = await fetchLiveStations();
                const actualData = response.data || response;

                if (Array.isArray(actualData)) {
                    console.log("Live stations loaded:", actualData.length);
                    setStations(actualData);
                } else {
                    console.error("Data received is not an array:", actualData);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };
        loadStations();
    }, []);

    if (!apiKey) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'red' }}>
                <h2>Error: Google Maps API Key is missing!</h2>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>

            {/* Click panel — overlaid on the map */}
            {selectedStation && (
                <div className="sidebar-info-window">
                    <button className="close-btn" onClick={() => setSelectedStation(null)}>×</button>
                    <h2>{selectedStation.name}</h2>
                    <hr />
                    <div className="stats-container">
                        <div className="stat-card">
                            <span>Available Bikes</span>
                            <strong>{selectedStation.available_bikes ?? '—'}</strong>
                        </div>
                        <div className="stat-card">
                            <span>Free Stands</span>
                            <strong>{selectedStation.available_bike_stands ?? '—'}</strong>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', marginBottom: '6px' }}>
                        <strong>Address:</strong> {selectedStation.address}
                    </p>
                    <p style={{ fontSize: '0.85rem' }}>
                        <strong>Status:</strong> {selectedStation.status}
                    </p>
                </div>
            )}

            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={DUBLIN_CENTER}
                    defaultZoom={13}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    mapId={"DEMO_MAP_ID"}
                >
                    <StationMarkers
                        stations={stations}
                        onStationClick={(station) => setSelectedStation(station)}
                    />
                </Map>
            </APIProvider>
            <Legend />
        </div>
    );
}