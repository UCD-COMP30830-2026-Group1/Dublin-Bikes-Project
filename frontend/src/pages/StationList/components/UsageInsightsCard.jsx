export default function UsageInsightsCard() {
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
                    marginBottom: '20px',
                    fontSize: '1.8rem',
                    color: '#111827'
                }}
            >
                Usage Insights
            </h3>

            <div style={{ display: 'grid', gap: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: '#f3e8ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem'
                        }}
                    >
                        ↗
                    </div>
                    <div>
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: '1.3rem',
                                color: '#111827'
                            }}
                        >
                            Peak Hours
                        </div>
                        <div
                            style={{
                                color: '#6b7280',
                                fontSize: '1.1rem'
                            }}
                        >
                            8–10 AM and 5–7 PM on weekdays
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem'
                        }}
                    >
                        🕒
                    </div>
                    <div>
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: '1.3rem',
                                color: '#111827'
                            }}
                        >
                            Best Time to Visit
                        </div>
                        <div
                            style={{
                                color: '#6b7280',
                                fontSize: '1.1rem'
                            }}
                        >
                            11 AM – 2 PM for best availability
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: '#dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem'
                        }}
                    >
                        🚲
                    </div>
                    <div>
                        <div
                            style={{
                                fontWeight: 700,
                                fontSize: '1.3rem',
                                color: '#111827'
                            }}
                        >
                            Average Turnover
                        </div>
                        <div
                            style={{
                                color: '#6b7280',
                                fontSize: '1.1rem'
                            }}
                        >
                            8–12 bikes cycled per hour during peak
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}