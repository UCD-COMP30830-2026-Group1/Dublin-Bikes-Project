import { useEffect, useState } from 'react';
import { getWeatherForecast } from '../../../api/weather';

export default function useWeatherForecast() {
    const [forecast, setForecast] = useState([]);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                setLoading(true);
                setError('');

                const data = await getWeatherForecast();
                setForecast(data?.['24_hour_forecast'] || []);
                setLocation(data?.location || null);
            } catch (err) {
                console.error('Weather fetch failed:', err);
                setError('Failed to load weather forecast.');
            } finally {
                setLoading(false);
            }
        };

        fetchForecast();
    }, []);

    return {
        forecast,
        location,
        loading,
        error
    };
}