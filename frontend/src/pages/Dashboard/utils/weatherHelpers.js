export function formatTemp(temp) {
    if (temp === undefined || temp === null) return '--';
    return `${Math.round(temp)}°C`;
}

export function formatHour(timeString) {
    if (!timeString) return '--';

    const date = new Date(timeString);
    return date.toLocaleTimeString('en-IE', {
        hour: 'numeric',
        hour12: true
    });
}

export function formatWind(speed) {
    if (speed === undefined || speed === null) return '--';
    return `${Number(speed).toFixed(1)} m/s`;
}

export function getWeatherIcon(item) {
    if (!item) return '☁️';

    const rain = Number(item.rain) || 0;
    const snow = Number(item.snow) || 0;
    const humidity = Number(item.humidity) || 0;

    if (rain > 0.2) return '🌧️';
    if (snow > 0) return '❄️';
    if (humidity > 85) return '☁️';
    return '⛅';
}

export function getWeatherLabel(item) {
    if (!item) return 'Unknown';

    const rain = Number(item.rain) || 0;
    const snow = Number(item.snow) || 0;
    const wind = Number(item.wind_speed) || 0;
    const humidity = Number(item.humidity) || 0;

    if (snow > 0) return 'Snowy';

    if (rain > 15) return 'Very Heavy Rain';
    if (rain > 7.5) return 'Heavy Rain';
    if (rain > 2.5) return 'Moderate Rain';
    if (rain > 0.2) return 'Light Rain';

    if (wind >= 25) return 'Storm';
    if (wind >= 17) return 'Very Strong Wind';
    if (wind >= 10) return 'Strong Wind';
    if (wind >= 5) return 'Moderate Wind';

    if (humidity > 85) return 'Cloudy';
    return 'Partly Cloudy';
}



function getRainLevel(rain) {
    const value = Number(rain) || 0;

    if (value > 15) return { label: 'very heavy rain', severity: 8 };
    if (value > 7.5) return { label: 'heavy rain', severity: 6 };
    if (value > 2.5) return { label: 'moderate rain', severity: 4 };
    if (value > 0.2) return { label: 'light rain', severity: 2 };
    return null;
}

function getWindLevel(wind) {
    const value = Number(wind) || 0;

    if (value >= 25) return { label: 'storm conditions', severity: 7 };
    if (value >= 17) return { label: 'very strong winds', severity: 5 };
    if (value >= 10) return { label: 'strong winds', severity: 3 };
    if (value >= 5) return { label: 'moderate winds', severity: 1 };
    return null;
}

export function getWeatherAlert(forecast = []) {
    if (!Array.isArray(forecast) || forecast.length === 0) {
        return 'Weather conditions are stable';
    }

    const now = new Date();
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const nextTwoHours = forecast.filter((item) => {
        if (!item?.time) return false;
        const itemTime = new Date(item.time);
        return itemTime >= now && itemTime <= twoHoursLater;
    });

    if (nextTwoHours.length === 0) {
        return 'Weather conditions are stable';
    }

    let mostSevere = null;

    for (const item of nextTwoHours) {
        const rainCondition = getRainLevel(item?.rain);
        const windCondition = getWindLevel(item?.wind_speed);

        if (rainCondition && (!mostSevere || rainCondition.severity > mostSevere.severity)) {
            mostSevere = rainCondition;
        }

        if (windCondition && (!mostSevere || windCondition.severity > mostSevere.severity)) {
            mostSevere = windCondition;
        }
    }

    if (!mostSevere) {
        return 'Weather conditions are stable';
    }

    return `⚠️ In the next 2 hours, expect ${mostSevere.label}`;
}