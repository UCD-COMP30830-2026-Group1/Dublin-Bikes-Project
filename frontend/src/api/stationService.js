// src/api/stationService.js
const API_DOMAIN = import.meta.env.VITE_API_DOMAIN || 'localhost:5000';
const protocol = API_DOMAIN.includes('localhost') ? 'http' : 'https';
const API_BASE_URL = `${protocol}://${API_DOMAIN}/api`;

export async function fetchStaticStations() {
    const targetUrl = `${API_BASE_URL}/stations/static`;
    console.log("Actual request url:", targetUrl);

    const response = await fetch(targetUrl);

    if (!response.ok) {
        throw new Error(`Request failed. Error: ${response.status}`);
    }

    return await response.json();
}