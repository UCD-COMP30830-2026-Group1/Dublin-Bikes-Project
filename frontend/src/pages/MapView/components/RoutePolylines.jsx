import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

export default function RoutePolylines({ plannedRouteData }) {
    const map = useMap();
    const polylineRefs = useRef([]);

    useEffect(() => {
        if (!map || !window.google?.maps?.geometry?.encoding) return;

        polylineRefs.current.forEach((line) => line.setMap(null));
        polylineRefs.current = [];

        if (!plannedRouteData) return;

        const decodePath = (encodedPolyline) => {
            if (!encodedPolyline) return null;
            return window.google.maps.geometry.encoding.decodePath(encodedPolyline);
        };

        const createPolyline = (path, options) => {
            if (!path || path.length === 0) return null;

            const polyline = new window.google.maps.Polyline({
                path,
                map,
                ...options,
            });

            polylineRefs.current.push(polyline);
            return polyline;
        };

        const drawCasedLine = (path, mainOptions, casingOptions = {}) => {
            if (!path || path.length === 0) return;

            // Draw a white casing under the route so it stays visible above the map
            createPolyline(path, {
                strokeColor: '#ffffff',
                strokeOpacity: 0.95,
                strokeWeight: (mainOptions.strokeWeight || 6) + 4,
                zIndex: (mainOptions.zIndex || 100) - 1,
                ...casingOptions,
            });

            // Draw the main route line on top
            createPolyline(path, mainOptions);
        };

        const walkToStartPath = decodePath(plannedRouteData?.walkToStart?.encodedPolyline);
        const bikeLegPath = decodePath(plannedRouteData?.bikeLeg?.encodedPolyline);
        const walkToDestinationPath = decodePath(plannedRouteData?.walkToDestination?.encodedPolyline);

        // Walk segment 1: dark grey dashed line with a white casing
        if (walkToStartPath?.length) {
            createPolyline(walkToStartPath, {
                strokeColor: '#ffffff',
                strokeOpacity: 0.95,
                strokeWeight: 10,
                zIndex: 119,
            });

            createPolyline(walkToStartPath, {
                strokeColor: '#4b5563',
                strokeOpacity: 0,
                strokeWeight: 6,
                zIndex: 120,
                icons: [
                    {
                        icon: {
                            path: 'M 0,-1 0,1',
                            strokeOpacity: 1,
                            strokeColor: '#374151',
                            scale: 4,
                        },
                        offset: '0',
                        repeat: '14px',
                    },
                ],
            });
        }

        // Bike segment: thicker blue line with a white casing
        if (bikeLegPath?.length) {
            drawCasedLine(bikeLegPath, {
                strokeColor: '#2563eb',
                strokeOpacity: 1,
                strokeWeight: 7,
                zIndex: 140,
            });
        }

        // Walk segment 2: red dashed line to make the final walk easier to distinguish
        if (walkToDestinationPath?.length) {
            createPolyline(walkToDestinationPath, {
                strokeColor: '#ffffff',
                strokeOpacity: 0.95,
                strokeWeight: 10,
                zIndex: 129,
            });

            createPolyline(walkToDestinationPath, {
                strokeColor: '#ef4444',
                strokeOpacity: 0,
                strokeWeight: 6,
                zIndex: 130,
                icons: [
                    {
                        icon: {
                            path: 'M 0,-1 0,1',
                            strokeOpacity: 1,
                            strokeColor: '#ef4444',
                            scale: 4,
                        },
                        offset: '0',
                        repeat: '14px',
                    },
                ],
            });
        }

        return () => {
            polylineRefs.current.forEach((line) => line.setMap(null));
            polylineRefs.current = [];
        };
    }, [map, plannedRouteData]);

    return null;
}