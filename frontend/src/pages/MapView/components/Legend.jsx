// src/pages/MapView/components/Legend.jsx
export default function Legend() {
    return (
         <div style={{
            position: 'absolute',
            bottom: '30px',
            right: '20px',
            backgroundColor: 'white',
            padding: '10px 16px',
            borderRadius: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            zIndex: 5,
            display: 'flex',
            gap: '16px',
            fontSize: '0.85rem',
            color: '#4b5563',
            fontWeight: 500
        }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span style={{display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e'}}></span>
                <span>Available</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span style={{display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b'}}></span>
                <span>Low</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <span style={{display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444'}}></span>
                <span>Empty</span>
            </div>
        </div>
    );
}