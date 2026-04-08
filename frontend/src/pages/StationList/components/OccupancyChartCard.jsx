export default function OccupancyChartCard({ viewMode }) {
    return (
        <div
            style={{
                background: '#ffffff',
                borderRadius: '18px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                padding: '24px'
            }}
        >
            <h3
                style={{
                    marginTop: 0,
                    marginBottom: '8px',
                    fontSize: '1.8rem',
                    color: '#111827'
                }}
            >
                {viewMode === 'hourly'
                    ? 'Hourly Occupancy Pattern'
                    : 'Weekly Occupancy Pattern'}
            </h3>

            <div
                style={{
                    color: '#6b7280',
                    marginBottom: '20px'
                }}
            >
                {viewMode === 'hourly'
                    ? 'Average bike availability throughout the day'
                    : 'Average bike availability by day of week'}
            </div>

            <div
                style={{
                    height: '320px',
                    borderRadius: '12px',
                    background: 'linear-gradient(to bottom, #fafafa, #f4f6f8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#6b7280',
                    fontSize: '1.1rem'
                }}
            >
                {viewMode === 'hourly'
                    ? 'Hourly chart placeholder'
                    : 'Daily chart placeholder'}
            </div>
        </div>
    );
}