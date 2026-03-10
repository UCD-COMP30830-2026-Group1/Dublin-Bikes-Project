// src/App.jsx
import {Header} from "./layouts/Header.jsx";
import Footer from "./layouts/Footer.jsx";
import MapView from "./pages/MapView/index.jsx";
import StationList from "./pages/StationList/index.jsx";
import Dashboard from "./pages/Dashboard/index.jsx";

function App() {
    return (<div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
            {/* 1. Header*/}
            <Header/>
            {/* 2. Body Container: station details */}
            <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
                {/* 2A. Left Sidebar*/}
                <StationList/>

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