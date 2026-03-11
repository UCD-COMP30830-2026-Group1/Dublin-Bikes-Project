// src/pages/MapView/index.jsx
import { APIProvider, Map, AdvancedMarker,Pin} from '@vis.gl/react-google-maps';
import {DUBLIN_CENTER} from "../../config/constants.js";
import Legend from "./components/Legend.jsx";
import {useEffect, useState} from "react";
import {fetchStaticStations} from "../../api/stationService.js";

export default function MapView() {
  // 1. Vite-specific syntax for reading environment variables (it must be `import.meta.env`).
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  const [stations,setStations] = useState([]);

    useEffect(() => {
        const loadStations = async()=>{
            try{
                console.log("Request data from the Flask backend");
                const stationData = await fetchStaticStations();
                console.log("Data successfully retrieved! Total number of stations found:\", stationData.length");
                console.log("The data looks like:",stationData);

                setStations(stationData);
            }catch (error){
                console.log(error);
            }
        };
        loadStations();
    }, []);

  // 2. if the apikey not exists, return error directly
  if (!apiKey) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'red' }}>
        <h2>🚨 Error: Google Maps API Key is missing!</h2>
          <br/>
        <p>Please check your .env file and restart the server.</p>
      </div>
    );
  }
  // 3. otherwise return the map loaded from api key
  return (
    // The outer container must have width and height. Otherwise, the rendered map will be 0x0.
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>

      {/* APIProvider：Responsible for quietly loading Google's JS scripts in the background */}
      <APIProvider apiKey={apiKey}>

        {/* Map：The visual map component */}
        <Map
          defaultCenter={DUBLIN_CENTER}
          defaultZoom={13}
          gestureHandling={'greedy'} // Allows users to drag directly with a single finger/mouse
          disableDefaultUI={true}    // Disables the default complex controls (looks more sophisticate)
          zoomControl={false}
          mapId={"DEMO_MAP_ID"}      // Prepares for loading of AdvancedMarker
        >
        </Map>

      </APIProvider>

      <Legend />

    </div>
  );
}