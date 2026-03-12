// src/layouts/Header.jsx
import { useState } from 'react';
import headerLogo from '../assets/bike-logo2.png'

function Header({ viewMode, setViewMode }) {
    const [isHovered, setIsHovered] = useState(false);

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
            {/*Changed the view mode*/}
            <div
                style={{position: 'relative', height: '100%', display: 'flex', alignItems: 'center'}}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div style={{cursor: 'pointer', fontSize: '1.5rem'}}>☰</div>
                {isHovered && (
                    <div style={{
                        position: 'absolute',
                        top: '60px', // 刚好贴着导航栏底部
                        right: '-10px',
                        backgroundColor: 'white',
                        color: '#333',
                        width: '200px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        borderRadius: '0 0 8px 8px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 20
                    }}>
                        {/* Choice 1：Station details */}
                        <div
                            onClick={() => setViewMode('stations')}
                            style={{
                                padding: '15px 20px',
                                cursor: 'pointer',
                                backgroundColor: viewMode === 'stations' ? '#e6f4ea' : 'transparent', // 选中时带点浅绿色
                                borderBottom: '1px solid #eee',
                                fontWeight: viewMode === 'stations' ? 'bold' : 'normal',
                                color: viewMode === 'stations' ? '#0ba83b' : '#333'
                            }}
                        >
                            🚲 Station Info
                        </div>

                        {/*Choice 2: Route planning*/}
                        <div
                            onClick={() => setViewMode('routes')}
                            style={{
                                padding: '15px 20px',
                                cursor: 'pointer',
                                backgroundColor: viewMode === 'routes' ? '#e6f4ea' : 'transparent',
                                fontWeight: viewMode === 'routes' ? 'bold' : 'normal',
                                color: viewMode === 'routes' ? '#0ba83b' : '#333'
                            }}
                        >
                            📍 Route Planning
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header

