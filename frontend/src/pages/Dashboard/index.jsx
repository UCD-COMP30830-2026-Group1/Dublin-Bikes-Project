// src/pages/Dashboard/index.jsx

export default function Dashboard() {
    return (
        <footer style={{
            height: '180px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #ddd',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 4
        }}>
            <div style={{backgroundColor: '#fff3cd', color: '#856404', padding: '8px 20px', fontSize: '0.85rem'}}>
                ⚠️ Strong winds expected this evening (25-35 km/h) (just an example)
            </div>
            <div style={{flex: 1, padding: '15px 20px', display: 'flex', gap: '20px'}}>
                Weather information
            </div>
        </footer>
    );
}