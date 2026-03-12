// src/layouts/Footer.jsx
export default function Footer() {
    return (
        /* Global Footer: Copyright and tools declaration */
        <footer style={{
            height: '30px',
            backgroundColor: '#2c3e50',
            color: '#a0aabf',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
            zIndex: 10
        }}>
            <span>© 2026 Dublin Bikes Project Comp30830 Group1. Powered by React + Vite + Flask + MySQL.</span>
        </footer>
    );
}