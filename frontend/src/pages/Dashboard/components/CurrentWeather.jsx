import {
    formatTemp,
    formatWind,
    getWeatherIcon,
    getWeatherLabel
} from '../utils/weatherHelpers';

export default function CurrentWeather({ current, location }) {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontSize: '2rem' }}>
                    {getWeatherIcon(current)}
                </div>

                <div>
                    <div
                        style={{
                            fontSize: '1.9rem',
                            fontWeight: 700,
                            color: '#212529',
                            lineHeight: 1
                        }}
                    >
                        {formatTemp(current?.temp)}
                    </div>

                    <div
                        style={{
                            fontSize: '1rem',
                            color: '#6c757d',
                            marginTop: '4px'
                        }}
                    >
                        {getWeatherLabel(current)}
                        {location?.city ? ` · ${location.city}` : ''}
                    </div>
                </div>
            </div>

            <div
                style={{
                    fontSize: '1rem',
                    color: '#495057',
                    fontWeight: 500
                }}
            >
                🌬 {formatWind(current?.wind_speed)}
            </div>
        </div>
    );
}