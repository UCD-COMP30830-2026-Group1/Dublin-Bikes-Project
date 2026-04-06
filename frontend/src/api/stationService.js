// src/api/stationService.js
const API_BASE_URL = '/api';

// Used by StationList or anything that only needs static metadata
export async function fetchStaticStations() {
    const response = await fetch(`${API_BASE_URL}/stations/static`);
    if (!response.ok) throw new Error(`Static fetch failed: ${response.status}`);
    return await response.json();
}

// Used by MapView — returns everything: position, live bike counts, status
export async function fetchRealtimeStations() {
    const response = await fetch(`${API_BASE_URL}/stations/realtime`);
    if (!response.ok) throw new Error(`Realtime fetch failed: ${response.status}`);
    return await response.json();
}
