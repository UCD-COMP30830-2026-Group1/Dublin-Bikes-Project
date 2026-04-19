// src/pages/MapView/index.jsx
import { useEffect, useState } from "react";
import { Map } from '@vis.gl/react-google-maps';
import { DUBLIN_CENTER } from "../../config/constants.js";
import { fetchRealtimeStations } from "../../api/stationService.js";
import Legend from "./components/Legend.jsx";
import StationMarkers from "./components/StationMarkers.jsx";
import RoutePolylines from "./components/RoutePolylines.jsx";
import LocationPins from "./components/LocationPins.jsx";
import MapBoundsFitter from "./components/MapBoundsFitter.jsx";

export default function MapView({
    selectedStation,
    selectedNearestStation,
    selectedDestinationStation,
    nearestStations = [],
    destinationNearestStations = [],
    plannedRouteData,
    userLocation,
    destinationLocation,
    hoveredStation,
    onStationClick
}) {
    const [stations, setStations] = useState([]);

    useEffect(() => {
        const loadStations = async () => {
            try {
                const response = await fetchRealtimeStations();
                const data = response.data || response || [];
                console.log("Realtime stations loaded:", data.length);
                setStations(data);
            } catch (error) {
                console.error("Failed to load stations:", error);
            }
        };

        loadStations();
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Map
                defaultCenter={DUBLIN_CENTER}
                defaultZoom={14}
                gestureHandling="greedy"
                disableDefaultUI={true}
                mapId="DEMO_MAP_ID"
            >
                <RoutePolylines plannedRouteData={plannedRouteData} />

                <LocationPins
                    userLocation={userLocation}
                    destinationLocation={destinationLocation}
                />
                <MapBoundsFitter
                    userLocation={userLocation}
                    nearestStations={nearestStations}
                />

                <StationMarkers
                    stations={stations}
                    selectedStation={selectedStation}
                    selectedNearestStation={selectedNearestStation}
                    selectedDestinationStation={selectedDestinationStation}
                    nearestStations={nearestStations}
                    destinationNearestStations={destinationNearestStations}
                    hoveredStation={hoveredStation}
                    onStationClick={onStationClick}
                />
            </Map>

            <Legend />
        </div>
    );
}