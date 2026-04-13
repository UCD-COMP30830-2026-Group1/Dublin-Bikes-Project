export default function FloatingModeSwitch({ viewMode, setViewMode }) {
  const baseButtonStyle = {
    flex: 1,
    padding: '16px 20px',
    borderRadius: '14px',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    fontWeight: 600,
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        width: '100%',
        marginBottom: '16px',
      }}
    >
      <button
        onClick={() => setViewMode('stations')}
        style={{
          ...baseButtonStyle,
          border: viewMode === 'stations' ? '2px solid #16a34a' : '1px solid #d1d5db',
          background: viewMode === 'stations' ? '#eef8f0' : '#fff',
          color: viewMode === 'stations' ? '#15803d' : '#111827',
        }}
      >
        Station Info
      </button>

      <button
        onClick={() => setViewMode('routes')}
        style={{
          ...baseButtonStyle,
          border: viewMode === 'routes' ? '2px solid #16a34a' : '1px solid #d1d5db',
          background: viewMode === 'routes' ? '#eef8f0' : '#fff',
          color: viewMode === 'routes' ? '#15803d' : '#111827',
        }}
      >
        Route Planner
      </button>
    </div>
  );
}