// src/pages/MapView/index.jsx
import {APIProvider, Map, AdvancedMarker, Pin} from '@vis.gl/react-google-maps';
import {DUBLIN_CENTER} from "../../config/constants.js";
import Legend from "./components/Legend.jsx";
import StationMarkers from "./components/StationMarkers.jsx";
import {useEffect, useState} from "react";
import {fetchStaticStations} from "../../api/stationService.js";

export default function MapView() {
    // 1. Vite-specific syntax for reading environment variables (it must be `import.meta.env`).
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

    const [stations, setStations] = useState([]);
    // This state is used to track which station is currently selected (for the sidebar details view)
    const [selectedStation, setSelectedStation] = useState(null);

    useEffect(() => {
        const loadStations = async () => {
        try {
            console.log("Request data from the Flask backend");

            const stationData = await fetchStaticStations();

            console.log("Data successfully retrieved!");
            console.log("Total number of stations found:", stationData.length);
            console.log("The data looks like:", stationData);

            setStations(stationData);
        } catch (error) {
            console.error(error);
        }
    };
    loadStations();
    }, []);

    // If the apikey not exists, return error directly
    if (!apiKey) {
        return (
            <div
                style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'red'}}>
                <h2> Error: Google Maps API Key is missing!</h2>
                <br/>
                <p>Please check your .env file and restart the server.</p>
            </div>
        );
    }
    // If it does exist, return the map loaded from api key
    return (
        // The outer container must have width and height. Otherwise, the rendered map will be 0x0.
        <div style={{width: '100%', height: '100%', position: 'relative'}}>
            {/* The Sidebar Element: Only renders when a station is clicked */}
                {selectedStation && (
                    <div className="sidebar-info-window">
                    <button className="close-btn" onClick={() => setSelectedStation(null)}>×</button>
                    <h2>{selectedStation.name}</h2>
                    <hr />
                    <div className="stats-container">
                        <div className="stat-card">
                            <span>Available Bikes</span>
                            <strong>{selectedStation.available_bikes}</strong>
                        </div>
                        <div className="stat-card">
                            <span>Available Stands</span>
                            <strong>{selectedStation.available_bike_stands}</strong>
                        </div>
                    </div>
                    <p><strong>Address:</strong> {selectedStation.address}</p>
                    <p><strong>Status:</strong> {selectedStation.status}</p>
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
                    {/* THE MARKER LAYER: Passing the selection logic down */}
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