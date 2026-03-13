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
        // 2. DATA PROTECTION: Skip this marker if coordinates are missing
        const lat = station.position?.lat;
        const lng = station.position?.lng;

        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Station ${station.number} has invalid coordinates:`, station);
          return null; 
        }

        const markerColor = getMarkerColor(station.available_bikes, station.bike_stands);

        return (
          <AdvancedMarker
            key={station.number}
            position={{
                lat: station.position.lat,
                lng: station.position.lng
            }}
            onMouseEnter={() => setHoveredStation(station)}
            onMouseLeave={() => setHoveredStation(null)}
            onClick={() => onStationClick(station)}
          >
            <Pin background={markerColor} borderColor={'#2c3e50'} glyphColor={'#ffffff'} />

            {hoveredStation?.number === station.number && (
              <InfoWindow position={{ lat, lng }} disableAutoPan={true}>
                <div style={{ color: '#2c3e50', fontSize: '12px', padding: '2px' }}>
                  <div style={{ fontWeight: 'bold' }}>{station.name}</div>
                  <div>🚲 Bikes: {station.available_bikes}</div>
                  <div>🅿️ Stands: {station.available_bike_stands}</div>
                </div>
              </InfoWindow>
            )}
          </AdvancedMarker>
        );
      })}
    </>
  );
}