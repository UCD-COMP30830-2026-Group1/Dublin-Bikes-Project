// src/App.jsx
import { useState } from 'react';
import Header from "./layouts/Header.jsx";
import Footer from "./layouts/Footer.jsx";
import MapView from "./pages/MapView/index.jsx";
import StationList from "./pages/StationList/index.jsx";
import Dashboard from "./pages/Dashboard/index.jsx";
import RoutePlanning from "./pages/RoutePlanning/index.jsx";

function App() {
    //1. Defined the view mode：'stations'(stations information) or 'routes'(route planning)
    const [viewMode, setViewMode] = useState('stations');

    return (<div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
            {/* 1. Header*/}
            <Header viewMode={viewMode} setViewMode={setViewMode}/>
            {/* 2. Body Container: station details */}
            <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
                {/* 2A. Left Sidebar: StationList mode/ Route Planning mode*/}
                <aside style={{
                  width: '320px',
                  backgroundColor: 'white',
                  boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
                  zIndex: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '20px'
                }}>
                  {viewMode === 'stations' ? <StationList /> : <RoutePlanning />}
                </aside>

                {/* 2B. Right Content Area*/}
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>

                    {/* Upper right area：Map area */}
                    <MapView/>

                    {/* Bottom right area：weather */}
                    <Dashboard/>

                </div>

            </div>
            {/* Global Footer: Copyright and tools declaration *//* Global Footer: Copyright and tools declaration */}
            <Footer/>

        </div>);
}

export default App;