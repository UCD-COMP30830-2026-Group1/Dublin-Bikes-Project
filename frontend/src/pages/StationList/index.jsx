// src/pages/StationList/index.jsx

const JourneyGuide = () => {
    const steps = [
        {
            number: 1,
            title: "Switch to Route Planner",
            desc: "Click the Route Planner tab at the top to open navigation",
            color: "#467b4b"// green
        },
        {
            number: 2,
            title: "Locate Yourself & Pick a Bike",
            desc: "Hit Localise Me, then select one of the 3 nearest stations",
            color: "#83bfd6" // blue
        },
        {
            number: 3,
            title: "Set Destination & Plan",
            desc: "Search for your destination and choose a drop-off station",
            color: "#eab248" // purple
        }
    ];

    return (
        <div style={{ padding: '0px 8px' }}>
            <h3 style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                color: '#849679',
                textTransform: 'uppercase',
                borderBottom: '1px solid #d1d5db',
                paddingBottom: '10px',
                marginBottom: '16px'
            }}>
                Quick Start Guide
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {steps.map((step) => (
                    <div key={step.number} style={{
                        backgroundColor: 'rgba(255, 255,255, 0.5)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            backgroundColor: step.color, color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', fontWeight: 700, flexShrink: 0, marginTop: '2px'
                        }}>
                            {step.number}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1f2937' }}>{step.title}</div>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '4px', lineHeight: 1.4 }}>
                                {step.desc}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* bottom tip */}
            <div style={{
                marginTop: '32px', padding: '12px', background: '#f0fdf4',
                borderRadius: '12px', border: '1px dashed #bbf7d0', fontSize: '0.8rem', color: '#166534'
            }}>
                💡 <b>Pro Tip:</b> Our planner combines walking and cycling to give you the most realistic journey time!
            </div>
        </div>
    );
};

// src/pages/StationList/index.jsx

export default function StationList({ stations = [], isLoading = false }) {
    // 逻辑：如果正在加载，或者站点列表为空（比如初次进入），显示指南
    if (isLoading || stations.length === 0) {
        return (
            <aside style={{ height: '100%', overflowY: 'auto' }}>
                <JourneyGuide />
            </aside>
        );
    }

    // 如果数据加载完成了，再显示组员做的 Station 卡片列表
    return (
        <aside style={{ height: '100%', overflowY: 'auto', padding: '10px' }}>
            {/* 组员原本的列表逻辑放在这里 */}
            <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '12px' }}>
                Showing all available stations
            </div>
            {stations.map(station => (
                <div key={station.number}>{/* Station Card UI */}</div>
            ))}
        </aside>
    );
}