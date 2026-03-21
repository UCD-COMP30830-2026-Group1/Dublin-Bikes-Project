import { useState } from 'react';
import Header from "./layouts/Header.jsx";
import Footer from "./layouts/Footer.jsx";
import MapView from "./pages/MapView/index.jsx";
import StationList from "./pages/StationList/index.jsx";
import Dashboard from "./pages/Dashboard/index.jsx";
import RoutePlanning from "./pages/RoutePlanning/index.jsx";
import StationDetails from "./pages/StationDetails/index.jsx";
function App() {
    const [viewMode, setViewMode] = useState('stations');
    const [selectedStation, setSelectedStation] = useState(null);
    const [showStationDetailsPage, setShowStationDetailsPage] = useState(false);

    const handleSelectStation = (station) => {
        setSelectedStation(station);
        setViewMode('stations');
        setShowStationDetailsPage(false);
    };

    const handleCloseStation = () => {
        setSelectedStation(null);
        setShowStationDetailsPage(false);
    };

    const handleOpenDetailsPage = () => {
        if (selectedStation) {
            setShowStationDetailsPage(true);
        }
    };

    const handleBackToMap = () => {
        setShowStationDetailsPage(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f4f6f8' }}>
            <Header viewMode={viewMode} setViewMode={setViewMode} />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {viewMode === 'stations' && selectedStation && !showStationDetailsPage && (
                    <aside
                        style={{
                            width: '320px',
                            backgroundColor: 'white',
                            boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
                            zIndex: 5,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <StationList
                            station={selectedStation}
                            onClose={handleCloseStation}
                            onOpenDetails={handleOpenDetailsPage}
                        />
                    </aside>
                )}

                {viewMode === 'routes' && (
                    <aside
                        style={{
                            width: '320px',
                            backgroundColor: 'white',
                            boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
                            zIndex: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '20px'
                        }}
                    >
                        <RoutePlanning />
                    </aside>
                )}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {viewMode === 'stations' && showStationDetailsPage && selectedStation ? (
                        <StationDetails station={selectedStation} onBack={handleBackToMap} />
                    ) : (
                        <>
                            <MapView
                                selectedStation={selectedStation}
                                onSelectStation={handleSelectStation}
                            />
                            <Dashboard />
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default App;