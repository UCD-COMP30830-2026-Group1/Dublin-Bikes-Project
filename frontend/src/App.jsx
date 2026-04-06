// src/App.jsx
import { useState } from 'react';
import Header from "./layouts/Header.jsx";
import Footer from "./layouts/Footer.jsx";
import MapView from "./pages/MapView/index.jsx";
import StationList from "./pages/StationList/index.jsx";
import StationDetail from "./pages/StationList/components/StationDetail.jsx";
import MoreInfoModal from "./pages/StationList/components/MoreInfoModal.jsx";
import Dashboard from "./pages/Dashboard/index.jsx";
import RoutePlanning from "./pages/RoutePlanning/index.jsx";

function App() {

    const [viewMode, setViewMode] = useState('stations');
    // Lifted up so MapView (markers) and sidebar (detail panel) share the same selected station
    const [selectedStation, setSelectedStation] = useState(null);
    // Controls whether the More Information modal is open
    const [showMoreInfo, setShowMoreInfo] = useState(false);

    // Close station detail and reset modal state
    const handleCloseStationDetail = () => {
        setSelectedStation(null);
        setShowMoreInfo(false);
    };
    // Open More Information modal
    const handleOpenMoreInfo = () => {
        setShowMoreInfo(true);
    };
    // Close More Information modal
    const handleCloseMoreInfo = () => {
        setShowMoreInfo(false);
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' , overflow: 'hidden' }}>
            <Header viewMode={viewMode} setViewMode={setViewMode} />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden',minHeight: 0  }}>
                {/* Left Sidebar */}
                <aside style={{
                    width: '240px',
                    backgroundColor: 'white',
                    boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    overflowY: 'auto',
                }}>
                    {viewMode === 'routes' ? (
                        <RoutePlanning />
                    ) : selectedStation ? (
                        // Station clicked — show detail panel
                        <StationDetail
                            station={selectedStation}
                            onClose={handleCloseStationDetail}
                            onMoreInfoClick={handleOpenMoreInfo}
                        />
                    ) : (
                        // Nothing selected — show station list
                        <StationList />
                    )}
                </aside>

                {/* Right content */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        minHeight: 0,
                    }}
                >
                    <div style={{ flex: 2.8, minHeight: 0 }}>
                        <MapView
                            selectedStation={selectedStation}
                            onStationClick={(station) => {
                                setSelectedStation(station);
                                setShowMoreInfo(false);
                            }}
                        />
                    </div>



                    <div style={{ flex: 1.3, minHeight: 0, overflow: 'hidden' }}>
                        <Dashboard />
                    </div>
                </div>
            </div>
            {showMoreInfo && selectedStation && (
                <MoreInfoModal
                    station={selectedStation}
                    onClose={handleCloseMoreInfo}
                />
            )}

            <Footer />
        </div>
    );
}

export default App;
