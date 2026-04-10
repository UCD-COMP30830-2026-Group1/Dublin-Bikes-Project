export default function WeatherAlert({ message }) {
    return (
        <div
            style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '8px 20px',
                fontSize: '0.85rem',
                borderBottom: '1px solid #f0e1a6'
            }}
        >
            {message}
        </div>
    );
}