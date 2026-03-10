// src/pages/MapView/index.jsx

export default function MapView(){
    return(
        <main style={{ flex: 1, position: 'relative' }}>
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#888'
            }}>
                <h1>Map Component Goes Here</h1>
            </div>

            {/* Legend */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                backgroundColor: 'white',
                padding: '10px 15px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}>
                <h4 style={{margin: '0 0 10px 0', fontSize: '0.9rem'}}>Status</h4>
                <div style={{fontSize: '0.8rem', lineHeight: '1.8'}}>
                    <div>🟢 Available</div>
                    <div>🟡 Low</div>
                    <div>🔴 Empty</div>
                </div>
            </div>
        </main>
    );
}