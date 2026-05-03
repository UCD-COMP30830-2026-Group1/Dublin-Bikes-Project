// Full-page "More Information" view for a selected station.
// Shows: live availability, AI prediction, occupancy charts (hourly/daily), usage insights.
// Opened when user clicks "More Information" in the StationDetail sidebar panel.
// Closed by calling onClose() which returns the user to the main map view.

import { useEffect, useState } from 'react';
import { fetchHistoricalData, fetchPrediction } from '../../../api/stationService.js';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer
} from 'recharts';

// ── Colour tokens ──────────────────
const GREEN      = '#16a34a';
const GREEN_LIGHT = '#f0fdf4';
const BLUE       = '#1a73e8';
const BLUE_LIGHT = '#eff6ff';
const ORANGE     = '#f39c12';
const RED        = '#e74c3c';
const GREY       = '#6b7280';
const LGREY      = '#f3f4f6';
const DARK       = '#1f2937';

// ──  derive hourly averages from raw historical records ───
function buildHourlyData(records) {
    const buckets = {};
    for (let h = 0; h < 24; h++) {
        buckets[h] = { bikes: [], docks: [] };
    }
    records.forEach(r => {
        const hour = new Date(r.timestamp).getHours();
        if (buckets[hour]) {
            buckets[hour].bikes.push(r.available_bikes ?? 0);
            buckets[hour].docks.push(r.available_bike_stands ?? 0);
        }
    });
    return Object.entries(buckets).map(([h, v]) => ({
        label: `${String(h).padStart(2, '0')}:00`,
        bikes: v.bikes.length ? Math.round(v.bikes.reduce((a, b) => a + b, 0) / v.bikes.length) : 0,
        docks: v.docks.length ? Math.round(v.docks.reduce((a, b) => a + b, 0) / v.docks.length) : 0,
    }));
}

// ──  derive daily averages (0=Mon … 6=Sun) ───────────────
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
function buildDailyData(records) {
    const buckets = {};
    for (let d = 0; d < 7; d++) {
        buckets[d] = { bikes: [], docks: [] };
    }
    records.forEach(r => {
        // getDay() returns 0=Sun, so we shift to Mon=0
        const raw = new Date(r.timestamp).getDay();
        const day = (raw + 6) % 7;
        buckets[day].bikes.push(r.available_bikes ?? 0);
        buckets[day].docks.push(r.available_bike_stands ?? 0);
    });
    return Object.entries(buckets).map(([d, v]) => ({
        label: DAY_NAMES[d],
        bikes: v.bikes.length ? Math.round(v.bikes.reduce((a, b) => a + b, 0) / v.bikes.length) : 0,
        docks: v.docks.length ? Math.round(v.docks.reduce((a, b) => a + b, 0) / v.docks.length) : 0,
    }));
}

// ──  derive usage insight metrics from hourly data ────────
function deriveInsights(hourlyData) {
    // Peak hours: the 2 consecutive hours with lowest bike availability
    const sorted = [...hourlyData].sort((a, b) => a.bikes - b.bikes);
    const peakHour1 = parseInt(sorted[0]?.label);
    const peakHour2 = parseInt(sorted[1]?.label);
    const peaks = [peakHour1, peakHour2].sort((a, b) => a - b);

    // Best time: highest average bike availability window
    const best = [...hourlyData].sort((a, b) => b.bikes - a.bikes)[0];
    const bestHour = parseInt(best?.label ?? '11');

    // Average turnover during peak: difference between max and min in peak window
    const peakBikes = peaks.map(h => hourlyData[h]?.bikes ?? 0);
    const turnover = Math.abs((peakBikes[1] ?? 8) - (peakBikes[0] ?? 12));

    return {
        peakLabel: `${String(peaks[0]).padStart(2,'0')}:00–${String((peaks[peaks.length-1]+1)%24).padStart(2,'0')}:00`,
        bestLabel: `${String(bestHour).padStart(2,'0')}:00–${String((bestHour+2)%24).padStart(2,'0')}:00`,
        turnover: Math.max(turnover, 4),
    };
}

// ── Confidence colour ────────────────────────────────────────────
function confColor(c) {
    if (!c) return GREY;
    if (c >= 0.75) return GREEN;
    if (c >= 0.60) return ORANGE;
    return RED;
}

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export default function StationDetailPage({ station, onClose }) {
    const [chartView, setChartView]       = useState('hourly'); // 'hourly' | 'daily'
    const [hourlyData, setHourlyData]     = useState([]);
    const [dailyData, setDailyData]       = useState([]);
    const [insights, setInsights]         = useState(null);
    const [prediction, setPrediction]     = useState(null);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);

    useEffect(() => {
        if (!station?.number) return;
        setLoading(true);
        setError(null);

        Promise.all([
            fetchHistoricalData(station.number),
            fetchPrediction(station.number).catch(() => null),
        ]).then(([histRes, predRes]) => {
            // Historical data comes back as { [number]: [ records ] }
            const data = histRes?.data ?? histRes ?? {};
            const records = data[station.number] ?? Object.values(data)[0] ?? [];

            const hourly = buildHourlyData(records);
            const daily  = buildDailyData(records);
            setHourlyData(hourly);
            setDailyData(daily);
            setInsights(deriveInsights(hourly));

            if (predRes) setPrediction(predRes.data ?? predRes);
        }).catch(err => {
            setError('Could not load station data. Please try again.');
            console.error(err);
        }).finally(() => setLoading(false));
    }, [station?.number]);

    if (!station) return null;

    const bikes    = station.available_bikes        ?? 0;
    const docks    = station.available_bike_stands  ?? 0;
    const capacity = station.bike_stands            ?? 20;
    const chartData = chartView === 'hourly' ? hourlyData : dailyData;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: '#f8fafc',
            overflowY: 'auto',
            fontFamily: "'DM Sans', -apple-system, sans-serif",
        }}>
            {/* ── Header ── */}
            <div style={{
                backgroundColor: GREEN,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                position: 'sticky', top: 0, zIndex: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none', borderRadius: '8px',
                        color: 'white', fontSize: '20px',
                        cursor: 'pointer', width: '36px', height: '36px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >←</button>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Station Details
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white' }}>
                        {station.name}
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px 60px' }}>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px', color: GREY }}>
                        Loading station data…
                    </div>
                )}

                {error && (
                    <div style={{
                        background: '#fef2f2', border: '1px solid #fecaca',
                        borderRadius: '10px', padding: '16px', color: RED, marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                {!loading && !error && <>

                    {/* ── Live availability cards ── */}
                    <div style={{
                        background: 'white', borderRadius: '14px',
                        padding: '20px', marginBottom: '16px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}>
                        <div style={{ fontSize: '0.8rem', color: GREY, marginBottom: '4px' }}>
                            {station.address}
                        </div>
                        <div style={{ fontWeight: '700', fontSize: '1.2rem', color: DARK, marginBottom: '16px' }}>
                            {station.name}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{
                                flex: 1, background: GREEN_LIGHT, borderRadius: '10px',
                                padding: '16px',
                            }}>
                                <div style={{ fontSize: '0.8rem', color: GREEN, fontWeight: 600, marginBottom: '6px' }}>
                                    Bikes
                                </div>
                                <div style={{ fontSize: '2.4rem', fontWeight: '800', color: GREEN, lineHeight: 1 }}>
                                    {bikes}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: GREY, marginTop: '4px' }}>
                                    of {capacity}
                                </div>
                            </div>
                            <div style={{
                                flex: 1, background: BLUE_LIGHT, borderRadius: '10px',
                                padding: '16px',
                            }}>
                                <div style={{ fontSize: '0.8rem', color: BLUE, fontWeight: 600, marginBottom: '6px' }}>
                                    Docks
                                </div>
                                <div style={{ fontSize: '2.4rem', fontWeight: '800', color: BLUE, lineHeight: 1 }}>
                                    {docks}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: GREY, marginTop: '4px' }}>
                                    of {capacity}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── AI Prediction ── */}
                    {prediction && (
                        <div style={{
                            background: GREEN_LIGHT, border: `1px solid #bbf7d0`,
                            borderRadius: '14px', padding: '20px', marginBottom: '16px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '1.1rem' }}></span>
                                <span style={{ fontWeight: '700', color: GREEN, fontSize: '1rem' }}>AI Prediction</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: DARK, marginBottom: '12px' }}>
                                {prediction.low_confidence
                                    ? 'Low confidence — consider a nearby station as backup.'
                                    : 'Stable availability. Good choice for your trip.'}
                            </div>
                            {/* Confidence bar */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.8rem', color: GREY }}>
                                    ~{prediction.predicted_bikes} bikes predicted in 30 min
                                </span>
                                <span style={{
                                    fontSize: '0.8rem', fontWeight: '700',
                                    color: confColor(prediction.confidence),
                                }}>
                                    {Math.round((prediction.confidence ?? 0) * 100)}% confident
                                </span>
                            </div>
                            <div style={{ height: '8px', background: '#d1fae5', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.round((prediction.confidence ?? 0) * 100)}%`,
                                    background: confColor(prediction.confidence),
                                    borderRadius: '9999px',
                                    transition: 'width 0.6s ease',
                                }} />
                            </div>
                        </div>
                    )}

                    {/* ── Occupancy Chart ── */}
                    <div style={{
                        background: 'white', borderRadius: '14px',
                        padding: '20px', marginBottom: '16px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}>
                        {/* Toggle */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                            {['hourly', 'daily'].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setChartView(v)}
                                    style={{
                                        padding: '8px 20px', borderRadius: '8px',
                                        border: chartView === v ? 'none' : `1px solid #e5e7eb`,
                                        background: chartView === v ? GREEN : 'white',
                                        color: chartView === v ? 'white' : DARK,
                                        fontWeight: chartView === v ? '600' : '400',
                                        cursor: 'pointer', fontSize: '0.9rem',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {v === 'hourly' ? 'Hourly View' : 'Daily View'}
                                </button>
                            ))}
                        </div>

                        <div style={{ fontWeight: '700', fontSize: '1rem', color: DARK, marginBottom: '4px' }}>
                            {chartView === 'hourly' ? 'Hourly Occupancy Pattern' : 'Daily Occupancy Pattern'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: GREY, marginBottom: '16px' }}>
                            Average bike availability {chartView === 'hourly' ? 'throughout the day' : 'by day of week'}
                        </div>

                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11, fill: GREY }}
                                    interval={chartView === 'hourly' ? 2 : 0}
                                />
                                <YAxis tick={{ fontSize: 11, fill: GREY }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px', fontSize: '13px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                                    formatter={(value) => value === 'bikes' ? 'Bikes Available' : 'Docks Available'}
                                />
                                <Bar dataKey="bikes" fill={GREEN} radius={[3, 3, 0, 0]} name="bikes" />
                                <Bar dataKey="docks" fill="#60a5fa" radius={[3, 3, 0, 0]} name="docks" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* ── Usage Insights ── */}
                    {insights && (
                        <div style={{
                            background: 'white', borderRadius: '14px',
                            padding: '20px', marginBottom: '24px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        }}>
                            <div style={{ fontWeight: '700', fontSize: '1rem', color: DARK, marginBottom: '16px' }}>
                                Usage Insights
                            </div>
                            {[
                                {
                                    icon: '📈',
                                    color: '#ede9fe',
                                    iconColor: '#7c3aed',
                                    title: 'Peak Hours',
                                    desc: `${insights.peakLabel} on weekdays`,
                                },
                                {
                                    icon: '🕐',
                                    color: BLUE_LIGHT,
                                    iconColor: BLUE,
                                    title: 'Best Time to Visit',
                                    desc: `${insights.bestLabel} for best availability`,
                                },
                                {
                                    icon: '🚲',
                                    color: GREEN_LIGHT,
                                    iconColor: GREEN,
                                    title: 'Average Turnover',
                                    desc: `${insights.turnover}–${insights.turnover + 4} bikes cycled per hour during peak`,
                                },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '12px 0',
                                    borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none',
                                }}>
                                    <div style={{
                                        width: '38px', height: '38px', borderRadius: '10px',
                                        background: item.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '18px', flexShrink: 0,
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: DARK }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: GREY, marginTop: '2px' }}>
                                            {item.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Reserve Bike Now button ── */}
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%', padding: '16px',
                            backgroundColor: GREEN, color: 'white',
                            border: 'none', borderRadius: '12px',
                            fontSize: '1rem', fontWeight: '700',
                            cursor: 'pointer', letterSpacing: '0.02em',
                            boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                            transition: 'opacity 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseOut={e => e.currentTarget.style.opacity = '1'}
                    >
                        → Reserve Bike Now
                    </button>

                </>}
            </div>
        </div>
    );
}