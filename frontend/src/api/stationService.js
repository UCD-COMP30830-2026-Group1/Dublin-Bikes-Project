// src/api/stationService.js
const API_DOMAIN = import.meta.env.VITE_API_DOMAIN || 'localhost:5000';
const protocol = API_DOMAIN.includes('localhost') ? 'http' : 'https';
const API_BASE_URL = `${protocol}://${API_DOMAIN}/api`;

export async function fetchStaticStations() {
    const targetUrl = `${API_BASE_URL}/stations/static`;
    console.log("Actual request url:", targetUrl);

    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Request failed. Error: ${response.status}`);
    return await response.json();
}

// NEW: Fetches stations merged with latest availability from DB.
// Returns each station with available_bikes, available_bike_stands, status.
export async function fetchLiveStations() {
    const targetUrl = `${API_BASE_URL}/stations/live`;
    console.log("Fetching live stations:", targetUrl);

    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Live fetch failed. Error: ${response.status}`);
    return await response.json();
}