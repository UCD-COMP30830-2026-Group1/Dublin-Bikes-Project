import { useState } from 'react';
import AiPredictionCard from './AiPredictionCard';
import UsageInsightsCard from './UsageInsightsCard';
import HourlyDailyToggle from './HourlyDailyToggle';
import OccupancyChartCard from './OccupancyChartCard';

export default function MoreInfoModal({ station, onClose }) {
    const [viewMode, setViewMode] = useState('hourly');
    const stationName = station?.name || 'Station Name';
    const bikes = station?.available_bikes ?? 0;
    const docks = station?.available_bike_stands ?? 0;
    const capacity = station?.bike_stands ?? 0;
    const address = station?.address || `${stationName}, Dublin 1`;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.25)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '24px'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: 'min(1040px, 92vw)',
                    maxHeight: '86vh',
                    overflowY: 'auto',
                    backgroundColor: '#f5f7fb',
                    borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                    padding: '28px'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '20px'
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: '2rem',
                                color: '#111827'
                            }}
                        >
                            {stationName}
                        </h2>
                        <div
                            style={{
                                marginTop: '8px',
                                color: '#6b7280',
                                fontSize: '1.1rem'
                            }}
                        >
                            📍 {address}
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            fontSize: '1.8rem',
                            cursor: 'pointer',
                            color: '#6b7280'
                        }}
                    >
                        ×
                    </button>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '18px',
                        marginBottom: '26px'
                    }}
                >
                    <div
                        style={{
                            background: '#edf7ef',
                            border: '1px solid #b7ebc6',
                            borderRadius: '16px',
                            padding: '24px'
                        }}
                    >
                        <div style={{ color: '#4b5563', marginBottom: '10px' }}>🚲 Bikes</div>
                        <div
                            style={{
                                fontSize: '3rem',
                                fontWeight: 700,
                                color: '#0f8a43'
                            }}
                        >
                            {bikes}
                        </div>
                        <div style={{ color: '#6b7280' }}>of {capacity}</div>
                    </div>

                    <div
                        style={{
                            background: '#eef4ff',
                            border: '1px solid #bfd4ff',
                            borderRadius: '16px',
                            padding: '24px'
                        }}
                    >
                        <div style={{ color: '#4b5563', marginBottom: '10px' }}>📍 Docks</div>
                        <div
                            style={{
                                fontSize: '3rem',
                                fontWeight: 700,
                                color: '#2563eb'
                            }}
                        >
                            {docks}
                        </div>
                        <div style={{ color: '#6b7280' }}>of {capacity}</div>
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <AiPredictionCard />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <HourlyDailyToggle viewMode={viewMode} setViewMode={setViewMode} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <OccupancyChartCard viewMode={viewMode} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <UsageInsightsCard />
                </div>

                <button
                    style={{
                        width: '100%',
                        height: '62px',
                        border: 'none',
                        borderRadius: '16px',
                        background: 'linear-gradient(180deg, #16a34a, #15803d)',
                        color: '#ffffff',
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                    }}
                >
                    Reserve Bike Now
                </button>
            </div>
        </div>
    );
}