import React, { useState } from 'react';
import { AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

export default function StationMarkers({ stations, onStationClick }) {
  const [hoveredStation, setHoveredStation] = useState(null);

  // 1. CRASH PROTECTION: If stations is null/undefined, don't break the app
  if (!stations || !Array.isArray(stations)) {
    console.error("StationMarkers Error: 'stations' prop is not an array!", stations);
    return null; 
  }

  const getMarkerColor = (available, total) => {
    // Fallback if numbers are missing
    if (available === undefined || available === null) return '#7f8c8d'; // Grey
    if (available === 0) return '#e74c3c'; // Red
    
    const percentage = (available / (total || 1)) * 100;
    if (percentage < 25) return '#f1c40f'; // Yellow
    return '#2ecc71'; // Green
  };

  return (
    <>
      {stations.map((station) => {
        // Use the flat keys position_lat and position_lng
        const lat = parseFloat(station.position_lat);
        const lng = parseFloat(station.position_lng);

        // Safety check: skip if data is missing or invalid
        if (isNaN(lat) || isNaN(lng)) {
          return null; 
        }

        const markerColor = getMarkerColor(station.available_bikes, station.bike_stands);

        return (
          <AdvancedMarker
            key={station.number}
            position={{ lat, lng }} // Google expects an object {lat: number, lng: number}
            onMouseEnter={() => setHoveredStation(station)}
            onMouseLeave={() => setHoveredStation(null)}
            onClick={() => onStationClick(station)}
          >
            <Pin background={markerColor} borderColor={'#2c3e50'} glyphColor={'#ffffff'} />
            
            {/* Tooltip logic remains the same */}
            {hoveredStation?.number === station.number && (
              <InfoWindow position={{ lat, lng }} disableAutoPan={true}>
                <div style={{ color: '#2c3e50', fontSize: '12px' }}>
                  <strong>{station.name}</strong><br/>
                  🚲 Bikes: {station.available_bikes}<br/>
                  🅿️ Stands: {station.available_bike_stands}
                </div>
              </InfoWindow>
            )}
          </AdvancedMarker>
        );
      })}
    </>
  );
}