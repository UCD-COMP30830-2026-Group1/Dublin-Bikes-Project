//src/pages/RoutePlanning/index.jsx

import { useEffect, useRef, useState } from 'react';
import {
    formatDurationSeconds,
    formatMeters,
    planBikeJourney
} from '../../api/routePlanningService.js';

function StationCard({
    station,
    indexLabel,
    onSelectStation,
    badgeColor = '#15803d',
    isActive = false
}) {
    return (
        <div
            onClick={() => onSelectStation?.(station)}
            style={{
                background: isActive ? '#dbeafe' : '#ecfdf5',
                border: isActive ? '2px solid #2563eb' : '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '10px 12px',
                cursor: 'pointer'
            }}
        >
            <div
                style={{
                    fontSize: '0.72rem',
                    color: badgeColor,
                    fontWeight: 700,
                    marginBottom: '4px'
                }}
            >
                {indexLabel}
            </div>

            <div
                style={{
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    marginBottom: '6px',
                    color: '#111827',
                    lineHeight: 1.25
                }}
            >
                {station.name}
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem',
                    color: '#374151'
                }}
            >
                <span>🚲 Bikes: {station.available_bikes ?? 0}</span>
                <span>📍 Docks: {station.available_bike_stands ?? 0}</span>
            </div>

            <div
                style={{
                    fontSize: '0.74rem',
                    color: '#6b7280',
                    marginTop: '4px'
                }}
            >
                Distance: {station.distanceKm?.toFixed(2)} km
            </div>
        </div>
    );
}

function RouteStepCard({ icon, title, value, subValue }) {
    return (
        <div
            style={{
                background: '#f3f4f6',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}
        >
            <div style={{ fontSize: '1.2rem', width: '18px' }}>{icon}</div>
            <div>
                <div style={{ fontWeight: 700, color: '#111827' }}>{title}</div>
                <div style={{ color: '#4b5563', marginTop: '2px' }}>{value}</div>
                {subValue ? (
                    <div style={{ color: '#6b7280', fontSize: '0.86rem', marginTop: '2px' }}>
                        {subValue}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default function RoutePlanning({
    userLocation,
    locationError,
    locationLoading,
    requestUserLocation,
    destinationLocation,
    setDestinationLocation,
    nearestStations = [],
    nearestDestinationStations = [],
    selectedNearestStation,
    selectedDestinationStation,
    onSelectNearestStation,
    onSelectDestinationStation,
    plannedRouteData,
    setPlannedRouteData
}) {
    const [destination, setDestination] = useState('');
    const [error, setError] = useState('');
    const [showPlannedRoute, setShowPlannedRoute] = useState(false);
    const [planningLoading, setPlanningLoading] = useState(false);
    const [planningError, setPlanningError] = useState('');

    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);

    useEffect(() => {
        if (!window.google || !window.google.maps?.places || !inputRef.current) return;

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: 'ie' },
            fields: ['formatted_address', 'geometry', 'name'],
        });

        autocompleteRef.current = autocomplete;

        const listener = autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();

            if (!place || !place.geometry || !place.geometry.location) {
                setError('Please select a destination from the suggestions.');
                setDestinationLocation(null);
                setShowPlannedRoute(false);
                setPlannedRouteData(null);
                return;
            }

            const resolvedAddress = place.formatted_address || place.name || '';

            setDestination(resolvedAddress);
            setError('');
            setPlanningError('');
            setShowPlannedRoute(false);
            setPlannedRouteData(null);

            setDestinationLocation({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: resolvedAddress,
            });
        });

        return () => {
            if (listener) window.google.maps.event.removeListener(listener);
        };
    }, [setDestinationLocation]);

    const handleSearch = () => {
        setError('Please select a destination from the suggestions.');
    };

    const handleClearDestination = () => {
        setDestination('');
        setError('');
        setPlanningError('');
        setShowPlannedRoute(false);
        setPlannedRouteData(null);
        setDestinationLocation(null);

        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
    };

    const canPlanRoute =
        !!userLocation &&
        !!destinationLocation &&
        !!selectedNearestStation &&
        !!selectedDestinationStation;

    const handlePlanRoute = async () => {
        if (!canPlanRoute) return;

        try {
            setPlanningLoading(true);
            setPlanningError('');

            const result = await planBikeJourney({
                userLocation,
                startStation: selectedNearestStation,
                endStation: selectedDestinationStation,
                destinationLocation,
            });

            setPlannedRouteData(result);
            setShowPlannedRoute(true);
        } catch (err) {
            console.error('Failed to plan route:', err);
            setPlanningError(err.message || 'Failed to plan route.');
        } finally {
            setPlanningLoading(false);
        }
    };

    const handleStartJourney = () => {
        if (!userLocation || !selectedNearestStation?.position) {
            setPlanningError('Missing user location or selected start station.');
            return;
        }

        const origin = `${userLocation.lat},${userLocation.lng}`;
        const destination = `${selectedNearestStation.position.lat},${selectedNearestStation.position.lng}`;

        const url =
            `https://www.google.com/maps/dir/?api=1` +
            `&origin=${encodeURIComponent(origin)}` +
            `&destination=${encodeURIComponent(destination)}` +
            `&travelmode=walking`;

        window.location.href = url;
    };

    const walkToStart = plannedRouteData?.walkToStart;
    const bikeLeg = plannedRouteData?.bikeLeg;
    const walkToDestination = plannedRouteData?.walkToDestination;
    const summary = plannedRouteData?.summary;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                    Route Planning
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                    Enter a destination
                </p>
            </div>

            {locationError && (
                <div style={{ marginBottom: '14px', color: '#dc2626', fontSize: '0.9rem' }}>
                    {locationError}
                </div>
            )}

            <div style={{ position: 'relative', marginBottom: '18px' }}>
                <button
                    onClick={handleSearch}
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '1.4rem',
                        color: '#9ca3af',
                        cursor: 'pointer',
                    }}
                >
                    🔍
                </button>

                {destination && (
                    <button
                        onClick={handleClearDestination}
                        style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'transparent',
                            fontSize: '1rem',
                            color: '#9ca3af',
                            cursor: 'pointer',
                        }}
                    >
                        ✕
                    </button>
                )}

                <input
                    ref={inputRef}
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                    placeholder="Search destination"
                    style={{
                        width: '100%',
                        height: '54px',
                        borderRadius: '16px',
                        border: '1px solid #d1d5db',
                        padding: '0 40px 0 48px',
                        fontSize: '1rem',
                        outline: 'none',
                        backgroundColor: '#fff',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            {error && (
                <div style={{ marginBottom: '14px', color: '#dc2626', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}

            {planningError && (
                <div style={{ marginBottom: '14px', color: '#dc2626', fontSize: '0.9rem' }}>
                    {planningError}
                </div>
            )}

            {!destinationLocation && !error && !userLocation && (
                <div
                    style={{
                        flex: 1,
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        textAlign: 'center',
                        padding: '24px',
                    }}
                >
                    <div>
                        <div style={{ fontSize: '4rem', marginBottom: '18px', opacity: 0.5 }}>
                            📍
                        </div>
                        Set your location and destination to plan your route
                    </div>
                </div>
            )}

            {(userLocation || destinationLocation) && !showPlannedRoute && (
                <div
                    style={{
                        borderTop: '1px solid #e5e7eb',
                        paddingTop: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px'
                    }}
                >
                    {destinationLocation && (
                        <div
                            style={{
                                background: '#f8fafc',
                                border: '1px solid #e5e7eb',
                                borderRadius: '14px',
                                padding: '14px'
                            }}
                        >
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>
                                Destination
                            </div>
                            <div style={{ fontWeight: 600, color: '#111827', marginTop: '6px' }}>
                                {destinationLocation.address || destination}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 700 }}>
                            3 Nearest Stations from Your Location
                        </div>

                        {nearestStations.length > 0 ? (
                            nearestStations.map((station, index) => (
                                <StationCard
                                    key={`user-${station.number}`}
                                    station={station}
                                    indexLabel={`No. ${index + 1}`}
                                    onSelectStation={(clickedStation) => {
                                        setShowPlannedRoute(false);
                                        setPlannedRouteData(null);
                                        setPlanningError('');
                                        onSelectNearestStation?.(clickedStation);
                                    }}
                                    badgeColor="#111827"
                                    isActive={selectedNearestStation?.number === station.number}
                                />
                            ))
                        ) : (
                            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                Use "Localise Me" to show the nearest stations from your location.
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#7c3aed', fontWeight: 700 }}>
                            3 Nearest Stations from Destination
                        </div>

                        {destinationLocation ? (
                            nearestDestinationStations.length > 0 ? (
                                nearestDestinationStations.map((station, index) => (
                                    <StationCard
                                        key={`destination-${station.number}`}
                                        station={station}
                                        indexLabel={`No. ${index + 1}`}
                                        onSelectStation={(clickedStation) => {
                                            setShowPlannedRoute(false);
                                            setPlannedRouteData(null);
                                            setPlanningError('');
                                            onSelectDestinationStation?.(clickedStation);
                                        }}
                                        badgeColor="#7c3aed"
                                        isActive={selectedDestinationStation?.number === station.number}
                                    />
                                ))
                            ) : (
                                <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                    No nearby stations found for this destination.
                                </div>
                            )
                        ) : (
                            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                                Select a destination to see nearby stations.
                            </div>
                        )}
                    </div>

                    {canPlanRoute && (
                        <button
                            onClick={handlePlanRoute}
                            disabled={planningLoading}
                            style={{
                                width: '100%',
                                height: '48px',
                                border: 'none',
                                borderRadius: '12px',
                                backgroundColor: '#08b43c',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '1rem',
                                cursor: planningLoading ? 'not-allowed' : 'pointer',
                                marginTop: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                opacity: planningLoading ? 0.8 : 1,
                            }}
                        >
                            {planningLoading ? 'Planning...' : '🧭 Plan Route'}
                        </button>
                    )}
                </div>
            )}

            {showPlannedRoute && plannedRouteData && (
                <div
                    style={{
                        borderTop: '1px solid #e5e7eb',
                        paddingTop: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                    }}
                >
                    <button
                        onClick={() => setShowPlannedRoute(false)}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#2563eb',
                            fontWeight: 600,
                            textAlign: 'left',
                            padding: 0,
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        ← Back to station selection
                    </button>

                    <div
                        style={{
                            background: '#ecfdf5',
                            border: '1px solid #bbf7d0',
                            borderRadius: '14px',
                            padding: '16px'
                        }}
                    >
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '14px' }}>
                            Your Route
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div
                                style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '50%',
                                    background: '#2563eb',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    flexShrink: 0
                                }}
                            >
                                1
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#111827' }}>
                                    Walk to {selectedNearestStation?.name}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '2px' }}>
                                    From your current location
                                </div>
                                <div style={{ color: '#374151', fontSize: '0.86rem', marginTop: '4px' }}>
                                    {formatMeters(walkToStart?.distanceMeters)} · {formatDurationSeconds(walkToStart?.durationSeconds)}
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                height: '24px',
                                borderLeft: '2px dashed #cbd5e1',
                                marginLeft: '16px',
                                marginTop: '6px',
                                marginBottom: '6px'
                            }}
                        />

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div
                                style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '50%',
                                    background: '#16a34a',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    flexShrink: 0
                                }}
                            >
                                2
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#111827' }}>
                                    Cycle to {selectedDestinationStation?.name}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '2px' }}>
                                    Pick up bike at {selectedNearestStation?.name}
                                </div>
                                <div style={{ color: '#374151', fontSize: '0.86rem', marginTop: '4px' }}>
                                    {formatMeters(bikeLeg?.distanceMeters)} · {formatDurationSeconds(bikeLeg?.durationSeconds)}
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                height: '24px',
                                borderLeft: '2px dashed #cbd5e1',
                                marginLeft: '16px',
                                marginTop: '6px',
                                marginBottom: '6px'
                            }}
                        />

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div
                                style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '50%',
                                    background: '#ef4444',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    flexShrink: 0
                                }}
                            >
                                3
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, color: '#111827' }}>
                                    Walk to destination
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '2px' }}>
                                    From {selectedDestinationStation?.name}
                                </div>
                                <div style={{ color: '#374151', fontSize: '0.86rem', marginTop: '4px' }}>
                                    {formatMeters(walkToDestination?.distanceMeters)} · {formatDurationSeconds(walkToDestination?.durationSeconds)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <RouteStepCard
                        icon="⏱"
                        title="Estimated Total Duration"
                        value={formatDurationSeconds(summary?.totalDurationSeconds)}
                    />

                    <RouteStepCard
                        icon="📏"
                        title="Total Distance"
                        value={formatMeters(summary?.totalDistanceMeters)}
                    />

                    <RouteStepCard
                        icon="🚶"
                        title="Journey Breakdown"
                        value={`Walk ${formatMeters((walkToStart?.distanceMeters || 0) + (walkToDestination?.distanceMeters || 0))} + Bike ${formatMeters(bikeLeg?.distanceMeters || 0)}`}
                    />

                    <button
                        onClick={handleStartJourney}
                        style={{
                            width: '100%',
                            height: '48px',
                            border: 'none',
                            borderRadius: '12px',
                            backgroundColor: '#08b43c',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            marginTop: '2px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        }}
                    >
                        → Start Journey
                    </button>
                </div>
            )}
        </div>
    );
}