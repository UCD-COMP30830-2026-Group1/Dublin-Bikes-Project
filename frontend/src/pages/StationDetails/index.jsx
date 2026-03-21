import { useEffect, useMemo, useState } from 'react';
import { fetchStationDetail } from '../../api/stationService.js';
import SimpleBarChart from './components/SimpleBarChart.jsx';

function InfoCard({ title, value, subtext, borderColor, backgroundColor, textColor }) {
    return (
        <div
            style={{
                border: `1px solid ${borderColor}`,
                backgroundColor,
                borderRadius: '16px',
                padding: '24px',
                flex: 1,
            }}
        >
            <div style={{ color: '#4b5563', marginBottom: '12px', fontSize: '15px' }}>
                {title}
            </div>
            <div
                style={{
                    fontSize: '54px',
                    fontWeight: 700,
                    color: textColor,
                    lineHeight: 1,
                }}
            >
                {value}
            </div>
            <div style={{ color: '#6b7280', marginTop: '8px', fontSize: '16px' }}>
                {subtext}
            </div>
        </div>
    );
}

export default function StationDetails({ station, onBack }) {
    const [detail, setDetail] = useState(null);
    const [tab, setTab] = useState('hourly');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDetail = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await fetchStationDetail(station.number);
                setDetail(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load station details.');
            } finally {
                setLoading(false);
            }
        };

        if (station?.number) {
            loadDetail();
        }
    }, [station]);

    const chartData = useMemo(() => {
        if (!detail) return [];

        if (tab === 'hourly') {
            return detail.hourly_pattern.filter((item) => {
                const hour = Number(item.label.split(':')[0]);
                return hour % 3 === 0;
            });
        }

        return detail.daily_pattern;
    }, [detail, tab]);

    const stationInfo = detail?.station || station;

    return (
        <div style={{ height: '100%', overflowY: 'auto', backgroundColor: '#f3f4f6' }}>
            <div
                style={{
                    height: '84px',
                    backgroundColor: '#0aae3f',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 28px',
                    fontSize: '22px',
                    fontWeight: 700,
                    gap: '18px',
                }}
            >
                <button
                    onClick={onBack}
                    style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'white',
                        fontSize: '34px',
                        cursor: 'pointer',
                    }}
                >
                    ←
                </button>
                <span>Station Details</span>
            </div>

            <div style={{ maxWidth: '1150px', margin: '28px auto', padding: '0 20px 28px' }}>
                <div
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '18px',
                        padding: '28px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                >
                    <h1 style={{ margin: 0, fontSize: '30px' }}>
                        {stationInfo?.name || 'Station'}
                    </h1>

                    <p style={{ margin: '12px 0 24px 0', color: '#4b5563', fontSize: '16px' }}>
                        📍 {stationInfo?.address || 'Unknown address'}
                    </p>

                    {loading ? (
                        <div style={{ padding: '20px 0', color: '#6b7280' }}>Loading...</div>
                    ) : error ? (
                        <div style={{ padding: '20px 0', color: '#dc2626' }}>{error}</div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', gap: '18px' }}>
                                <InfoCard
                                    title="Bikes"
                                    value={stationInfo?.available_bikes ?? 0}
                                    subtext={`of ${stationInfo?.bike_stands ?? 0}`}
                                    borderColor="#b8e3c8"
                                    backgroundColor="#eef8f0"
                                    textColor="#0f8a36"
                                />

                                <InfoCard
                                    title="Docks"
                                    value={stationInfo?.available_bike_stands ?? 0}
                                    subtext={`of ${stationInfo?.bike_stands ?? 0}`}
                                    borderColor="#c7d7fb"
                                    backgroundColor="#eef4ff"
                                    textColor="#2563eb"
                                />
                            </div>

                            <div style={{ marginTop: '22px', display: 'flex', gap: '14px' }}>
                                <button
                                    onClick={() => setTab('hourly')}
                                    style={{
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '16px 34px',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        backgroundColor: tab === 'hourly' ? 'white' : '#e5e7eb',
                                        color: tab === 'hourly' ? '#0f8a36' : '#4b5563',
                                        boxShadow: tab === 'hourly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                    }}
                                >
                                    Hourly View
                                </button>

                                <button
                                    onClick={() => setTab('daily')}
                                    style={{
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '16px 34px',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        fontWeight: 700,
                                        backgroundColor: tab === 'daily' ? 'white' : '#e5e7eb',
                                        color: tab === 'daily' ? '#0f8a36' : '#4b5563',
                                        boxShadow: tab === 'daily' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                    }}
                                >
                                    Daily View
                                </button>
                            </div>

                            <div style={{ marginTop: '22px' }}>
                                <SimpleBarChart
                                    data={chartData}
                                    title={tab === 'hourly' ? 'Hourly Occupancy Pattern' : 'Weekly Occupancy Pattern'}
                                    subtitle={
                                        tab === 'hourly'
                                            ? 'Average bike availability throughout the day'
                                            : 'Average bike availability by day of week'
                                    }
                                />
                            </div>

                            <div
                                style={{
                                    marginTop: '22px',
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    padding: '28px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                }}
                            >
                                <h3 style={{ margin: '0 0 24px 0', fontSize: '22px' }}>
                                    Usage Insights
                                </h3>

                                <div style={{ display: 'grid', gap: '22px' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        <div
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '14px',
                                                backgroundColor: '#f1e8ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '24px',
                                            }}
                                        >
                                            ↗
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 700 }}>
                                                Peak Hours
                                            </div>
                                            <div style={{ color: '#4b5563', marginTop: '4px' }}>
                                                {detail?.insights?.peak_hours || 'No data'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        <div
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '14px',
                                                backgroundColor: '#e8f0ff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '24px',
                                            }}
                                        >
                                            🕒
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 700 }}>
                                                Best Time to Visit
                                            </div>
                                            <div style={{ color: '#4b5563', marginTop: '4px' }}>
                                                {detail?.insights?.best_time || 'No data'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        <div
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '14px',
                                                backgroundColor: '#e7f7ea',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '24px',
                                            }}
                                        >
                                            🚲
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: 700 }}>
                                                Average Turnover
                                            </div>
                                            <div style={{ color: '#4b5563', marginTop: '4px' }}>
                                                {detail?.insights?.average_turnover !== undefined
                                                    ? `${detail.insights.average_turnover} bikes change per sample`
                                                    : 'No data'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}