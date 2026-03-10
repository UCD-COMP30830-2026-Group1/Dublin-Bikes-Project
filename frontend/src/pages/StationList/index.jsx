// src/pages/StationList/index.jsx

export default function StationList(){
    return(
        <aside style={{
          width: '320px',
          backgroundColor: 'white',
          boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px'
        }}>
           <div style={{ border: '1px dashed #ccc', height: '100%', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', textAlign: 'center' }}>
             Sidebar Component<br/>
           </div>
        </aside>
    );
}