// src/App.jsx
import { useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import Header from "./layouts/Header.jsx";
import Footer from "./layouts/Footer.jsx";
import MapView from "./pages/MapView/index.jsx";
import StationList from "./pages/StationList/index.jsx";
import StationDetail from "./pages/StationList/components/StationDetail.jsx";
import MoreInfoModal from "./pages/StationList/components/MoreInfoModal.jsx";
import NearestStationsList from "./pages/StationList/components/NearestStationsList.jsx";
import RoutePlanning from "./pages/RoutePlanning/index.jsx";
import Dashboard from "./pages/Dashboard/index.jsx";
import FloatingModeSwitch from "./pages/Shared/components/FloatingModeSwitch.jsx";
import { fetchRealtimeStations } from "./api/stationService.js";
import useUserLocation from "./pages/Shared/hooks/useUserLocation.js";
import { getNearestStations } from "./pages/Shared/utils/stationHelpers.js";
import StationDetailPage from "./pages/StationList/components/StationDetailPage.jsx";

function App() {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    const [viewMode, setViewMode] = useState('stations');
    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedNearestStation, setSelectedNearestStation] = useState(null);
    const [selectedDestinationStation, setSelectedDestinationStation] = useState(null);
    const [hoveredStation, setHoveredStation] = useState(null);
    const [plannedRouteData, setPlannedRouteData] = useState(null);
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [allStations, setAllStations] = useState([]);
    const [nearestStations, setNearestStations] = useState([]);
    const [destinationLocation, setDestinationLocation] = useState(null);
    const [nearestDestinationStations, setNearestDestinationStations] = useState([]);
    const [detailStation, setDetailStation] = useState(null);
    const openStationDetail = (station) => {setDetailStation(station);};

    const {
        userLocation,
        locationError,
        locationLoading,
        requestUserLocation,
    } = useUserLocation();

    useEffect(() => {
        const loadStations = async () => {
            try {
                const response = await fetchRealtimeStations();
                const data = response.data || response || [];
                setAllStations(data);
            } catch (error) {
                console.error('Failed to load stations:', error);
            }
        };

        loadStations();
    }, []);

    useEffect(() => {
        const result = getNearestStations(allStations, userLocation, 3);
        setNearestStations(result);
    }, [allStations, userLocation]);

    useEffect(() => {
        const result = getNearestStations(allStations, destinationLocation, 3);
        setNearestDestinationStations(result);
    }, [allStations, destinationLocation]);

    const handleCloseStationDetail = () => {
        setSelectedStation(null);
        setShowMoreInfo(false);
    };

    const handleOpenMoreInfo = () => {
        setShowMoreInfo(selectedStation);
    };

    const handleCloseMoreInfo = () => {
        setShowMoreInfo(false);
    };

    const handleSelectNearestStation = (station) => {
        setSelectedNearestStation((prev) =>
            prev?.number === station.number ? null : station
        );
        setPlannedRouteData(null);
    };

    const handleSelectDestinationStation = (station) => {
        setSelectedDestinationStation((prev) =>
            prev?.number === station.number ? null : station
        );
        setPlannedRouteData(null);
    };

    if (detailStation) {
    return (
        <StationDetailPage
            station={detailStation}
            onClose={() => setDetailStation(null)}
            />
        );
    }

    if (!apiKey) {
        return (
            <div style={{ padding: '24px', color: 'red' }}>
                Google Maps API key is missing.
            </div>
        );
    }

    return (
        <APIProvider apiKey={apiKey} libraries={['places', 'geometry']} region="IE">
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <Header viewMode={viewMode} setViewMode={setViewMode} />

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    <aside
                        style={{
                            width: '320px',
                            backgroundColor: '#f5f7f2',
                            boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
                            zIndex: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '20px',
                            overflowY: 'auto',
                            gap: '16px',
                        }}
                    >
                        <FloatingModeSwitch
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                        />

                        {viewMode === 'routes' ? (
                            <RoutePlanning
                                userLocation={userLocation}
                                locationError={locationError}
                                locationLoading={locationLoading}
                                requestUserLocation={requestUserLocation}
                                destinationLocation={destinationLocation}
                                setDestinationLocation={setDestinationLocation}
                                nearestStations={nearestStations}
                                nearestDestinationStations={nearestDestinationStations}
                                selectedNearestStation={selectedNearestStation}
                                selectedDestinationStation={selectedDestinationStation}
                                onSelectNearestStation={handleSelectNearestStation}
                                onSelectDestinationStation={handleSelectDestinationStation}
                                onStationHover={setHoveredStation}
                                plannedRouteData={plannedRouteData}
                                setPlannedRouteData={setPlannedRouteData}
                            />
                        ) : selectedStation ? (
                            <StationDetail
                                station={selectedStation}
                                onClose={handleCloseStationDetail}
                                onMoreInfo={(station) => setDetailStation(station)}
                            />
                        ) : nearestStations.length > 0 || userLocation || locationError ? (
                            <NearestStationsList
                                stations={nearestStations}
                                userLocation={userLocation}
                                locationError={locationError}
                                onSelectStation={setSelectedStation}
                                onStationHover={setHoveredStation}
                            />
                        ) : (
                            <StationList />
                        )}
                    </aside>

                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: '16px',
                                left: '24px',
                                zIndex: 20,
                            }}
                        >
                            <button
                                onClick={requestUserLocation}
                                disabled={locationLoading}
                                style={{
                                    height: '44px',
                                    padding: '0 18px',
                                    border: 'none',
                                    borderRadius: '12px',
                                    backgroundColor: '#2563eb',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    cursor: locationLoading ? 'not-allowed' : 'pointer',
                                    opacity: locationLoading ? 0.75 : 1,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                                }}
                            >
                                {locationLoading ? 'Locating...' : '📍 Localise Me'}
                            </button>
                        </div>

                        <MapView
                            selectedStation={selectedStation}
                            selectedNearestStation={selectedNearestStation}
                            selectedDestinationStation={selectedDestinationStation}
                            nearestStations={nearestStations}
                            destinationNearestStations={nearestDestinationStations}
                            plannedRouteData={plannedRouteData}
                            userLocation={userLocation}
                            destinationLocation={destinationLocation}
                            onStationHover={setHoveredStation}
                            onStationClick={(station) => {
                                setSelectedStation(station);
                                setShowMoreInfo(false);
                                setViewMode('stations');
                            }}
                        />

                        <Dashboard />
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
        </APIProvider>
    );
}

export default App;