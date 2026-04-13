///src/pages/MapView/components/RouteConnectionLine.jsx

import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

export default function RouteConnectionLine({
    selectedNearestStation,
    selectedDestinationStation
}) {
    const map = useMap();
    const polylineRef = useRef(null);

    useEffect(() => {
        if (!map || !window.google) return;

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
            polylineRef.current = null;
        }

        if (
            !selectedNearestStation?.position ||
            !selectedDestinationStation?.position
        ) {
            return;
        }

        polylineRef.current = new window.google.maps.Polyline({
            path: [
                {
                    lat: selectedNearestStation.position.lat,
                    lng: selectedNearestStation.position.lng,
                },
                {
                    lat: selectedDestinationStation.position.lat,
                    lng: selectedDestinationStation.position.lng,
                },
            ],
            geodesic: true,
            strokeOpacity: 0,
            strokeWeight: 3,
            icons: [
                {
                    icon: {
                        path: 'M 0,-1 0,1',
                        strokeOpacity: 1,
                        strokeColor: '#2563eb',
                        scale: 4,
                    },
                    offset: '0',
                    repeat: '12px',
                },
            ],
            map,
        });

        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
        };
    }, [map, selectedNearestStation, selectedDestinationStation]);

    return null;
}