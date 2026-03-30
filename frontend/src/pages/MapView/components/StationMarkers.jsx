// src/pages/MapView/components/StationMarkers.jsx
import React, { useState } from 'react';
import { AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

export default function StationMarkers({ stations, onStationClick }) {
    const [hoveredStation, setHoveredStation] = useState(null);

    if (!stations || !Array.isArray(stations)) {
        console.error("StationMarkers: 'stations' is not an array!", stations);
        return null;
    }

    const getMarkerColor = (available, total) => {
        if (available === undefined || available === null) return '#7f8c8d'; // Grey: no data
        if (available === 0) return '#e74c3c';                               // Red: 0 bikes
        const percentage = (available / (total || 1)) * 100;
        if (percentage <= 25) return '#f1c40f';                              // Yellow: >0 up to 25%
        return '#2ecc71';                                                    // Green: >25%
    };

    return (
        <>
            {stations.map((station) => {
                const lat = parseFloat(station.position_lat);
                const lng = parseFloat(station.position_lng);

                if (isNaN(lat) || isNaN(lng)) return null;

                const markerColor = getMarkerColor(station.available_bikes, station.bike_stands);

                return (
                    <AdvancedMarker
                        key={station.number}
                        position={{ lat, lng }}
                        onClick={() => onStationClick(station)}
                    >
                        {/*
                          * Listeners go on this inner <div>, NOT on AdvancedMarker.
                          * AdvancedMarker's onMouseEnter/Leave are unreliable in
                          * @vis.gl/react-google-maps — attaching to the DOM element
                          * inside is the correct pattern.
                        */}
                        <div
                            onMouseEnter={() => setHoveredStation(station)}
                            onMouseLeave={() => setHoveredStation(null)}
                        >
                            <Pin
                                background={markerColor}
                                borderColor={'#2c3e50'}
                                glyphColor={'#ffffff'}
                            />
                        </div>
                    </AdvancedMarker>
                );
            })}

            {/* InfoWindow rendered ONCE outside the loop — avoids AdvancedMarker nesting conflict */}
            {hoveredStation && (
                <InfoWindow
                    position={{
                        lat: parseFloat(hoveredStation.position_lat),
                        lng: parseFloat(hoveredStation.position_lng),
                    }}
                    disableAutoPan={true}
                    onCloseClick={() => setHoveredStation(null)}
                >
                    <div style={{ color: '#2c3e50', fontSize: '12px', lineHeight: '1.6' }}>
                        <strong>{hoveredStation.name}</strong><br />
                        🚲 Bikes: {hoveredStation.available_bikes ?? '—'}<br />
                        🅿️ Free Stands: {hoveredStation.available_bike_stands ?? '—'}
                    </div>
                </InfoWindow>
            )}
        </>
    );
}