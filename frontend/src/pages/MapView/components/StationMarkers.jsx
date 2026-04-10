// src/pages/MapView/components/StationMarkers.jsx
import React, { useState } from 'react';
import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

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
                transition: 'border 0.15s, box-shadow 0.15s',
            }}>
                {/* White bike SVG icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="white">
                    <path d="M5 20.5A3.5 3.5 0 0 1 1.5 17 3.5 3.5 0 0 1 5 13.5 3.5 3.5 0 0 1 8.5 17 3.5 3.5 0 0 1 5 20.5M5 12a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5M14.8 10H19V8.2h-3L13.2 4c-.3-.4-.9-.6-1.4-.6-.6 0-1.1.3-1.4.7L7.3 8.2C7 8.5 6.8 9 6.8 9.5c0 .6.3 1.1.7 1.4L11 13.2V20h2v-8l-2.8-2.2 2.1-2.6 2.5 2.8M19 20.5A3.5 3.5 0 0 1 15.5 17 3.5 3.5 0 0 1 19 13.5 3.5 3.5 0 0 1 22.5 17 3.5 3.5 0 0 1 19 20.5M19 12a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5M16 4.8C16 3.8 16.8 3 17.8 3S19.6 3.8 19.6 4.8 18.8 6.6 17.8 6.6 16 5.8 16 4.8z"/>
                </svg>
            </div>
        </div>
    );
}

export default function StationMarkers({ stations, selectedStation, onStationClick }) {
    const [hoveredStation, setHoveredStation] = useState(null);

    if (!stations || !Array.isArray(stations)) return null;

    const getMarkerColor = (available, total) => {
        if (available === undefined || available === null) return '#7f8c8d';
        if (available === 0) return '#e74c3c';
        const percentage = (available / (total || 1)) * 100;
        if (percentage <= 25) return '#f39c12';
        return '#27ae60';
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