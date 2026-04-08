// src/pages/MapView/index.jsx
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { DUBLIN_CENTER } from "../../config/constants.js";
import Legend from "./components/Legend.jsx";
import StationMarkers from "./components/StationMarkers.jsx";
import { useEffect, useState } from "react";
import { fetchRealtimeStations } from "../../api/stationService.js";

// selectedStation and onStationClick are now owned by App.jsx and passed down
export default function MapView({ selectedStation, onStationClick }) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    const [stations, setStations] = useState([]);

    useEffect(() => {
        const loadStations = async () => {
            try {
                const response = await fetchRealtimeStations();
                const data = response.data || response;
                console.log("Realtime stations loaded:", data.length);
                setStations(data);
            } catch (error) {
                console.error("Failed to load stations:", error);
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
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={DUBLIN_CENTER}
                    defaultZoom={13}
                    zoomControl={true}
                    zoomControlOptions={{position:3}}
                    fullscreenControl={true}
                    fullscreenControlOptions={{ position: 5 }}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    mapId={"DEMO_MAP_ID"}
                >
                    <StationMarkers
                        stations={stations}
                        selectedStation={selectedStation}
                        onStationClick={onStationClick}
                    />
                </Map>
            </APIProvider>
            <Legend />
        </div>
    );
}