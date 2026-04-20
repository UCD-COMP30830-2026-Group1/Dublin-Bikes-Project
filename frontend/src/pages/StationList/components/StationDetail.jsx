// src/pages/StationList/components/StationDetail.jsx
// Full replacement — adds ML prediction panel below Quick Stats

import { useEffect, useState } from 'react';
import { fetchPrediction } from '../../../api/stationService.js';

export default function StationDetail({ station, onClose }) {
    const [prediction, setPrediction]   = useState(null);
    const [predLoading, setPredLoading] = useState(true);
    const [predError, setPredError]     = useState(null);

    const bikes    = station.available_bikes        ?? 0;
    const docks    = station.available_bike_stands  ?? 0;
    const capacity = station.bike_stands            ?? null;
    const occupancy = capacity ? Math.round((bikes / capacity) * 100) : null;

    // Fetch prediction whenever the selected station changes
    useEffect(() => {
        if (!station?.number) return;
        setPredLoading(true);
        setPredError(null);
        setPrediction(null);

        fetchPrediction(station.number)
            .then(res => setPrediction(res.data || res))
            .catch(() => setPredError("Prediction unavailable"))
            .finally(() => setPredLoading(false));
    }, [station.number]);

    const handleDirections = () => {
        const lat = station.position?.lat;
        const lng = station.position?.lng;
        if (lat && lng) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                '_blank'
            );
        }
    };

    // Confidence colour
    const confidenceColor = (c) => {
        if (!c) return '#6B7280';
        if (c >= 0.75) return '#16a34a';
        if (c >= 0.60) return '#D97706';
        return '#DC2626';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1a1a1a', lineHeight: 1.3, flex: 1 }}>
                    {station.name}
                </h2>
                <button onClick={onClose} style={{
                    background: 'none', border: 'none', fontSize: '20px',
                    cursor: 'pointer', color: '#666', marginLeft: '8px', lineHeight: 1,
                }}>×</button>
            </div>

            <hr style={{ marginBottom: '16px', borderColor: '#eee' }} />

            {/* Bikes / Docks stat cards */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                    flex: 1, background: '#f0fdf4', borderRadius: '10px',
                    padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px',
                }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#16a34a' }}>🚲 Bikes</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#15803d', lineHeight: 1 }}>{bikes}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>available now</div>
                </div>
                <div style={{
                    flex: 1, background: '#eff6ff', borderRadius: '10px',
                    padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px',
                }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1d4ed8' }}>📍 Docks</div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1d4ed8', lineHeight: 1 }}>{docks}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>available now</div>
                </div>
            </div>

            {/* Buttons */}
            <button onClick={handleDirections} style={{
                width: '100%', padding: '12px', marginBottom: '10px',
                backgroundColor: '#1a73e8', color: 'white',
                border: 'none', borderRadius: '8px',
                fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
            }}>
                ➤ Get Directions
            </button>
            <button disabled style={{
                width: '100%', padding: '12px', marginBottom: '20px',
                backgroundColor: '#16a34a', color: 'white', opacity: 0.85,
                border: 'none', borderRadius: '8px',
                fontSize: '0.9rem', fontWeight: '600', cursor: 'not-allowed',
            }}>
                ⓘ More Information
            </button>

            <hr style={{ marginBottom: '16px', borderColor: '#eee' }} />

            {/* Quick Stats */}
            <div style={{ marginBottom: '20px' }}>
                <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '12px' }}>Quick Stats</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#555' }}>Total Capacity:</span>
                        <strong>{capacity ? `${capacity} bikes` : '—'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#555' }}>Occupancy:</span>
                        <strong>{occupancy !== null ? `${occupancy}%` : '—'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#555' }}>Status:</span>
                        <strong style={{ color: station.status === 'OPEN' ? '#16a34a' : '#dc2626' }}>
                            {station.status ?? '—'}
                        </strong>
                    </div>
                </div>
            </div>

            <hr style={{ marginBottom: '16px', borderColor: '#eee' }} />

            {/* ── ML Prediction Panel ── */}
            <div>
                <p style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '12px' }}>
                    Number of bikes predicted to be available in the next 30 minutes (AI-powered forecast)
                </p>

                {predLoading && (
                    <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>Loading prediction...</p>
                )}

                {predError && (
                    <p style={{ fontSize: '0.8rem', color: '#DC2626' }}>{predError}</p>
                )}

                {prediction && !predLoading && (
                    <div style={{
                        background: '#F8FAFC', borderRadius: '10px',
                        padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px',
                    }}>
                        {/* Predicted bike count */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                background: '#1a73e8', borderRadius: '8px',
                                padding: '8px 16px', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', lineHeight: 1 }}>
                                    {prediction.predicted_bikes}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>bikes predicted</div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#374151' }}>
                                estimated available<br />
                                in ~{prediction.horizon_minutes} minutes
                            </div>
                        </div>

                        {/* Confidence bar */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Confidence</span>
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: '600',
                                    color: confidenceColor(prediction.confidence),
                                }}>
                                    {Math.round(prediction.confidence * 100)}%
                                </span>
                            </div>
                            <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '9999px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${Math.round(prediction.confidence * 100)}%`,
                                    background: confidenceColor(prediction.confidence),
                                    borderRadius: '9999px',
                                    transition: 'width 0.5s ease',
                                }} />
                            </div>
                        </div>

                        {/* Low confidence warning */}
                        {prediction.low_confidence && (
                            <div style={{
                                background: '#FEF3C7', borderRadius: '6px',
                                padding: '8px 10px', fontSize: '0.75rem', color: '#92400E',
                            }}>
                                Low confidence — prediction may be less accurate for this station.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}