// src/pages/MapView/components/Legend.jsx
export default function Legend() {
    return (
        <div style={{
            position: 'absolute',
            bottom: '30px',
            right: '20px',
            backgroundColor: 'white',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 5
        }}>
            <h4 style={{margin: '0 0 12px 0', fontSize: '0.9rem'}}>Status</h4>
            <div style={{fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><span>🟢</span><span>Available</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><span>🟡</span><span>Low</span></div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}><span>🔴</span><span>Empty</span></div>
            </div>
        </div>
    );
}