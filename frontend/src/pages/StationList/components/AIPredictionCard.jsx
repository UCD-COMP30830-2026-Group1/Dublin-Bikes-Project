export default function AIPredictionCard() {
    return (
        <div
            style={{
                background: '#f7f1e7',
                border: '1px solid #f0c48a',
                borderRadius: '16px',
                padding: '22px 24px'
            }}
        >
            <div
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#b45309',
                    marginBottom: '14px'
                }}
            >
                🕒 AI Prediction
            </div>

            <div
                style={{
                    color: '#9a3412',
                    fontSize: '1.15rem',
                    marginBottom: '18px'
                }}
            >
                High demand expected in next 2 hours. Consider picking up a bike now.
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}
            >
                <div
                    style={{
                        flex: 1,
                        height: '12px',
                        background: '#f3e9d7',
                        borderRadius: '999px',
                        overflow: 'hidden'
                    }}
                >
                    <div
                        style={{
                            width: '87%',
                            height: '100%',
                            background: '#b45309',
                            borderRadius: '999px'
                        }}
                    />
                </div>

                <div
                    style={{
                        color: '#b45309',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                    }}
                >
                    87% confident
                </div>
            </div>
        </div>
    );
}
