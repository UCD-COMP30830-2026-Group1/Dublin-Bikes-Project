// src/api/stationService.js
const API_DOMAIN = import.meta.env.VITE_API_DOMAIN || 'localhost:5000';
const protocol = API_DOMAIN.includes('localhost') ? 'http' : 'https';
const API_BASE_URL = `${protocol}://${API_DOMAIN}/api`;

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

// Fetches ML prediction for a specific station.
// Returns: { predicted_bikes, confidence, horizon_minutes, low_confidence, model_rmse, model_r2 }
export async function fetchPrediction(stationNumber) {
    const response = await fetch(`${API_BASE_URL}/stations/predict?number=${stationNumber}`);
    if (!response.ok) throw new Error(`Prediction fetch failed: ${response.status}`);
    return await response.json();
}