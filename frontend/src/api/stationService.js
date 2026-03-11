// src/api/stationService.js
const API_BASE_URL = 'https://bikes.thegaff.io/api';

export async function fetchStaticStations() {
    const response = await fetch(`${API_BASE_URL}/stations/static`);
    return await response.json();
}