// src/api/stationService.js
const API_DOMAIN = import.meta.env.VITE_API_DOMAIN || 'localhost:5000';
const protocol = API_DOMAIN.includes('localhost') ? 'http' : 'https';
const API_BASE_URL = `${protocol}://${API_DOMAIN}/api`;

export async function fetchStaticStations() {
    const targetUrl = `${API_BASE_URL}/stations/static`;
    console.log("Fetching static stations:", targetUrl);

    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error(`Request failed. Error: ${response.status}`);
    return await response.json();
}

// Tries /live first (has availability data). Falls back to /static if not deployed yet.
export async function fetchLiveStations() {
    const liveUrl = `${API_BASE_URL}/stations/live`;
    console.log("Fetching live stations:", liveUrl);

    try {
        const response = await fetch(liveUrl);

        if (response.ok) {
            return await response.json();
        }

        // /live not deployed yet — fall back to /static
        console.warn(`/stations/live returned ${response.status}, falling back to /stations/static`);
        return await fetchStaticStations();

    } catch (err) {
        console.warn("Live fetch failed, falling back to static:", err.message);
        return await fetchStaticStations();
    }
}