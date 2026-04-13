//src/pages/Shared/components

import { useState } from 'react';

export default function useUserLocation() {
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    const requestUserLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser.');
            return;
        }

        setLocationLoading(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationLoading(false);
            },
            (error) => {
                console.error('Failed to get user location:', error);
                setLocationError('Unable to retrieve your location.');
                setLocationLoading(false);
            }
        );
    };

    return {
        userLocation,
        locationError,
        locationLoading,
        requestUserLocation,
    };
}