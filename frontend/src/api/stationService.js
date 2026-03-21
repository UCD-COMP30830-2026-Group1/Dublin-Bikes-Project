const API_DOMAIN = import.meta.env.VITE_API_DOMAIN || 'localhost:5000';
const protocol = API_DOMAIN.includes('localhost') ? 'http' : 'https';
const API_BASE_URL = `${protocol}://${API_DOMAIN}/api`;

async function getJson(path) {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return response.json();
}

export async function fetchStaticStations() {
    return getJson('/stations/static');
}

export async function fetchStationDetail(stationNumber) {
    return getJson(`/stations/detail/${stationNumber}`);
}

export async function fetchStationHistory(stationNumber) {
    return getJson(`/stations/historical?number=${stationNumber}`);
}

export async function fetchWeatherCurrent() {
    return getJson('/weather/current');
}

export async function fetchWeatherForecast() {
    return getJson('/weather/forecast');
}