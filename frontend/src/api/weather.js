export async function getWeatherForecast() {
    const response = await fetch('/api/weather/forecast');

    if (!response.ok) {
        throw new Error(`Failed to fetch weather forecast: ${response.status}`);
    }

    const result = await response.json();
    return result?.data || {};
}