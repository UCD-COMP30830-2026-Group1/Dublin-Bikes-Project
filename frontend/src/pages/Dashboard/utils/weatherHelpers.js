export function formatTemp(temp) {
    if (temp === undefined || temp === null) return '--';
    return `${Math.round(temp)}°C`;
}

export function formatHour(timeString) {
    if (!timeString) return '--';

    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
        hour: 'numeric',
        hour12: true
    });
}

export function formatWind(speed) {
    if (speed === undefined || speed === null) return '--';
    return `${speed.toFixed(1)} m/s`;
}

export function getWeatherIcon(item) {
    if (!item) return '☁️';
    if (item.rain > 0.2) return '🌧️';
    if (item.snow > 0) return '❄️';
    if (item.humidity > 85) return '☁️';
    return '⛅';
}

export function getWeatherLabel(item) {
    if (!item) return 'Unknown';
    if (item.rain > 0.2) return 'Rainy';
    if (item.snow > 0) return 'Snowy';
    if (item.humidity > 85) return 'Cloudy';
    return 'Partly Cloudy';
}

export function getWeatherAlert(forecast = []) {
    const windyHour = forecast.find((item) => item.wind_speed >= 5);

    if (windyHour) {
        return '⚠️ Strong winds expected in the coming hours';
    }

    const rainyHour = forecast.find((item) => item.rain > 0.3);
    if (rainyHour) {
        return '⚠️ Rain expected later today';
    }

    return 'Weather conditions are stable';
}