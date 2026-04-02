import useWeatherForecast from '../hooks/useWeatherForecast';
import { getWeatherAlert } from '../utils/weatherHelpers';
import WeatherAlert from './WeatherAlert';
import CurrentWeather from './CurrentWeather';
import ForecastCard from './ForecastCard';

export default function WeatherPanel() {
    const { forecast, location, loading, error } = useWeatherForecast();

    const current = forecast[0];
    const hourlyCards = forecast.slice(0, 6);
    const alertMessage = getWeatherAlert(forecast);

    return (
        <section
            style={{
                height: '280px',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #ddd',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                zIndex: 4
            }}
        >
            <WeatherAlert message={alertMessage} />

            <div
                style={{
                    flex: 1,
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}
            >
                {loading ? (
                    <div style={{ color: '#6c757d' }}>Loading weather forecast...</div>
                ) : error ? (
                    <div style={{ color: '#dc3545' }}>{error}</div>
                ) : (
                    <>
                        <CurrentWeather current={current} location={location} />

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
                    </>
                )}
            </div>
        </section>
    );
}