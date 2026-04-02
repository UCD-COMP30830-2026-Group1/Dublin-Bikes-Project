export default function HourlyDailyToggle({ viewMode, setViewMode }) {
    return (
        <div
            style={{
                display: 'inline-flex',
                background: '#eceff3',
                borderRadius: '14px',
                padding: '4px'
            }}
        >
            <button
                onClick={() => setViewMode('hourly')}
                style={{
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 22px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: viewMode === 'hourly' ? '#ffffff' : 'transparent',
                    color: viewMode === 'hourly' ? '#15803d' : '#4b5563',
                    boxShadow: viewMode === 'hourly' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
            >
                Hourly View
            </button>

            <button
                onClick={() => setViewMode('daily')}
                style={{
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 22px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: viewMode === 'daily' ? '#ffffff' : 'transparent',
                    color: viewMode === 'daily' ? '#15803d' : '#4b5563',
                    boxShadow: viewMode === 'daily' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
            >
                Daily View
            </button>
        </div>
    );
}