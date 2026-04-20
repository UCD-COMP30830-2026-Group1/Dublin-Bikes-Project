//src/pages/MapView/components/MapBoundsFitter.jsx
import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

export default function MapBoundsFitter({ userLocation, nearestStations }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !window.google?.maps || !userLocation || !nearestStations || nearestStations.length === 0) {
            return;
        }

        const bounds = new window.google.maps.LatLngBounds();

        // Add user location to bounds
        bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });

        // Add nearest stations to bounds
        nearestStations.forEach(station => {
            if (station.position?.lat && station.position?.lng) {
                bounds.extend({ lat: station.position.lat, lng: station.position.lng });
            }
        });

        // Use a small timeout to let the map finish rendering markers
        const timer = setTimeout(() => {
            map.fitBounds(bounds, {
                top: 60,
                bottom: 60,
                left: 360, // accommodate the sidebar width (~320px + margin)
                right: 60
            });
        }, 100);

        return () => clearTimeout(timer);

    }, [map, userLocation, nearestStations]);

    return null;
}
