import { useState } from 'react';
import useWeatherForecast from '../hooks/useWeatherForecast';
import { getWeatherAlert } from '../utils/weatherHelpers';
import WeatherAlert from './WeatherAlert';
import CurrentWeather from './CurrentWeather';
import ForecastCard from './ForecastCard';

export default function WeatherPanel() {
    const { forecast, location, loading, error } = useWeatherForecast();

    const [isExpanded, setIsExpanded] = useState(false);

    const current = forecast[0];
    const hourlyCards = forecast.slice(0, 6);
    const alertMessage = getWeatherAlert(forecast);

    return (
        <section
            style={{
                height: isExpanded ? '280px' : 'auto',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #ddd',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                zIndex: 4,
                transition: 'height 0.3s ease'
            }}
        >
            <WeatherAlert message={alertMessage} />

            <div
                style={{
                    flex: 1,
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    overflow: 'hidden'
                }}
            >
                {loading ? (
                    <div style={{ color: '#6c757d' }}>Loading weather forecast...</div>
                ) : error ? (
                    <div style={{ color: '#dc3545' }}>{error}</div>
                ) : (
                    <>
                        {/* Combine CurrentWeather and the collapse button into a clickable trigger. */}
                        <div
                            onClick={() => setIsExpanded(!isExpanded)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                padding: '4px 0'
                            }}
                            title={isExpanded ? "Click to collapse" : "Click to expand"}
                        >
                            <div style={{ flex: 1 }}>
                                <CurrentWeather current={current} location={location} />
                            </div>

                            {/* Use transform in conjunction with animation rotation */}
                            <div style={{
                                color: '#adb5bd',
                                fontSize: '0.9rem',
                                transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                                transition: 'transform 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px'
                            }}>
                                ▼
                            </div>
                        </div>

                        {/* Determine whether to render the 6-hour forecast based on the isExpanded state */}
                        {isExpanded && (
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(6, 1fr)',
                                    gap: '12px'
                                }}
                            >
                                {hourlyCards.map((item, index) => (
                                    <ForecastCard
                                        key={item.time || index}
                                        item={item}
                                        isNow={index === 0}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}