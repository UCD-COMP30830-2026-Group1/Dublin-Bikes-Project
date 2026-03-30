// src/pages/MapView/components/StationMarkers.jsx
import React, { useState } from 'react';
import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

// Custom bike-shaped marker — coloured circle with bike icon
// Blue ring shown when this station is selected (clicked)
function BikeMarker({ color, isSelected }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: color,
                border: isSelected ? '3px solid #1a73e8' : '2px solid rgba(0,0,0,0.25)',
                boxShadow: isSelected
                    ? '0 0 0 3px rgba(26,115,232,0.4)'
                    : '0 2px 6px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                transition: 'border 0.15s, box-shadow 0.15s',
            }}>
                🚲
            </div>
        </div>
    );
}

export default function StationMarkers({ stations, selectedStation, onStationClick }) {
    const [hoveredStation, setHoveredStation] = useState(null);

    if (!stations || !Array.isArray(stations)) return null;

    const getMarkerColor = (available, total) => {
        if (available === undefined || available === null) return '#7f8c8d';
        if (available === 0) return '#e74c3c';                              // Red
        const percentage = (available / (total || 1)) * 100;
        if (percentage <= 25) return '#f39c12';                             // Orange/yellow
        return '#27ae60';                                                   // Green
    };

    return (
        <>
            {stations.map((station) => {
                const lat = station.position?.lat;
                const lng = station.position?.lng;
                if (!lat || !lng) return null;

                const color = getMarkerColor(station.available_bikes, station.bike_stands);
                const isSelected = selectedStation?.number === station.number;

                return (
                    <AdvancedMarker
                        key={station.number}
                        position={{ lat, lng }}
                        onClick={() => onStationClick(station)}
                        zIndex={isSelected ? 99 : 1}
                    >
                        <div
                            onMouseEnter={() => setHoveredStation(station)}
                            onMouseLeave={() => setHoveredStation(null)}
                        >
                            <BikeMarker color={color} isSelected={isSelected} />
                        </div>
                    </AdvancedMarker>
                );
            })}

            {/* Hover tooltip — single InfoWindow outside the loop */}
            {hoveredStation && !selectedStation && (
                <InfoWindow
                    position={{
                        lat: hoveredStation.position.lat,
                        lng: hoveredStation.position.lng,
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