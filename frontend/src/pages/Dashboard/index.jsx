import { useEffect, useMemo, useState } from 'react';
import { fetchWeatherForecast } from '../../api/stationService.js';

function formatHour(timestamp, index) {
    const date = new Date(timestamp);
    if (index === 0) return 'Now';
    return date.toLocaleTimeString([], { hour: 'numeric' });
}

function getWeatherIcon(item, index) {
    if (item.rain > 0) return '🌧';
    if (index === 0 || item.humidity > 85) return '☁️';
    return '☀️';
}

export default function Dashboard() {
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        const loadWeather = async () => {
            try {
                const response = await fetchWeatherForecast();
                setWeather(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        loadWeather();
    }, []);

    const currentWeather = weather?.current;
    const hourlyForecast = useMemo(() => weather?.hourly_forecast || [], [weather]);

    return (
        <footer
            style={{
                minHeight: '190px',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #ddd',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 4
            }}
        >
            <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '8px 20px', fontSize: '0.95rem' }}>
                ⚠️ {weather?.alert || 'Weather data loaded from API.'}
            </div>

            <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '32px' }}>☁️</span>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>
                                {currentWeather ? `${Math.round(currentWeather.temp)}°C` : '--'}
                            </div>
                            <div style={{ color: '#4b5563' }}>Partly Cloudy</div>
                        </div>
                    </div>

                    <div style={{ color: '#4b5563', fontSize: '18px' }}>
                        💨 {currentWeather ? `${Math.round(currentWeather.wind_speed * 3.6)} km/h` : '--'}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                    {hourlyForecast.map((item, index) => (
                        <div
                            key={item.time}
                            style={{
                                backgroundColor: '#f1f3f5',
                                borderRadius: '14px',
                                padding: '14px 10px',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ color: '#6b7280', marginBottom: '8px' }}>
                                {formatHour(item.time, index)}
                            </div>
                            <div style={{ fontSize: '26px', marginBottom: '6px' }}>
                                {getWeatherIcon(item, index)}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 700 }}>
                                {Math.round(item.temp)}°
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </footer>
    );
}