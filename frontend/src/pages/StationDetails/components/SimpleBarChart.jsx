export default function SimpleBarChart({ data, title, subtitle }) {
    const maxValue = Math.max(
        ...data.flatMap((item) => [item.bikes, item.docks]),
        1
    );

    return (
        <div
            style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '28px 28px 22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
        >
            <h3 style={{ margin: 0, fontSize: '20px' }}>{title}</h3>
            <p style={{ margin: '10px 0 24px 0', color: '#6b7280' }}>{subtitle}</p>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '18px',
                    height: '260px',
                    borderLeft: '2px solid #d1d5db',
                    borderBottom: '2px solid #d1d5db',
                    padding: '10px 14px 0',
                    overflowX: 'auto',
                }}
            >
                {data.map((item) => (
                    <div
                        key={item.label}
                        style={{
                            flex: 1,
                            minWidth: '70px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            height: '100%',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '6px',
                                height: '100%',
                            }}
                        >
                            <div
                                title={`Bikes Available: ${item.bikes}`}
                                style={{
                                    width: '26px',
                                    height: `${(item.bikes / maxValue) * 100}%`,
                                    minHeight: item.bikes > 0 ? '8px' : 0,
                                    backgroundColor: '#10b981',
                                    borderRadius: '6px 6px 0 0',
                                }}
                            />
                            <div
                                title={`Docks Available: ${item.docks}`}
                                style={{
                                    width: '26px',
                                    height: `${(item.docks / maxValue) * 100}%`,
                                    minHeight: item.docks > 0 ? '8px' : 0,
                                    backgroundColor: '#3b82f6',
                                    borderRadius: '6px 6px 0 0',
                                }}
                            />
                        </div>

                        <div style={{ marginTop: '10px', color: '#4b5563', fontSize: '14px' }}>
                            {item.label}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '18px', display: 'flex', gap: '20px', color: '#4b5563' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                        style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '4px',
                            backgroundColor: '#10b981',
                            display: 'inline-block',
                        }}
                    />
                    Bikes Available
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                        style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '4px',
                            backgroundColor: '#3b82f6',
                            display: 'inline-block',
                        }}
                    />
                    Docks Available
                </div>
            </div>
        </div>
    );
}