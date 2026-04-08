import {
    formatTemp,
    formatHour,
    getWeatherIcon
} from '../utils/weatherHelpers';

export default function ForecastCard({ item, isNow = false }) {
    return (
        <div
            style={{
                backgroundColor: '#eef1f4',
                borderRadius: '14px',
                padding: '14px',
                textAlign: 'center'
            }}
        >
            <div
                style={{
                    fontSize: '0.95rem',
                    color: '#6c757d',
                    marginBottom: '10px'
                }}
            >
                {isNow ? 'Now' : formatHour(item?.time)}
            </div>

            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                {getWeatherIcon(item)}
            </div>

            <div
                style={{
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: '#212529'
                }}
            >
                {formatTemp(item?.temp)}
            </div>
        </div>
    );
}