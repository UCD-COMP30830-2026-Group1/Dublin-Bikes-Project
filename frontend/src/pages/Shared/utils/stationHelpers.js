export function getDistanceInKm(lat1, lng1, lat2, lng2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function getNearestStations(stations, userLocation, limit = 5) {
    if (!userLocation || !stations?.length) return [];

    return stations
        .filter((station) => station.position?.lat && station.position?.lng)
        .map((station) => ({
            ...station,
            distanceKm: getDistanceInKm(
                userLocation.lat,
                userLocation.lng,
                station.position.lat,
                station.position.lng
            ),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, limit);
}

export function getNearestStation(stations, targetLocation) {
    if (!targetLocation || !stations?.length) return null;

    const validStations = stations
        .filter((station) => station.position?.lat && station.position?.lng)
        .map((station) => ({
            ...station,
            distanceKm: getDistanceInKm(
                targetLocation.lat,
                targetLocation.lng,
                station.position.lat,
                station.position.lng
            ),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);

    return validStations[0] || null;
}