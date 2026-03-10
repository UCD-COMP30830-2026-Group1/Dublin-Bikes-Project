// src/layouts/Header.jsx
import headerLogo from '../assets/bike-logo2.png'

export function Header() {
    return (
        /* Header*/
        <header style={{
            height: '60px',
            backgroundColor: '#0ba83b',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 10
        }}>
            <div style={{width: '24px'}}></div>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <img
                    src={headerLogo}
                    alt="Dublin Bikes Logo"
                    style={{
                        height: '35px',
                        width: 'auto'
                    }}
                />
                <h2 style={{margin: 0, fontSize: '1.2rem'}}>
                    Dublin Bikes
                </h2>
            </div>
            <div style={{cursor: 'pointer', fontSize: '1.5rem'}}>☰</div>
        </header>
    );
}

