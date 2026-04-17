// src/api/routePlanningService.js
export async function planBikeJourney(payload) {
    const response = await fetch('/api/routes/plan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error || 'Failed to plan route');
    }

    return data;
}

export function formatMeters(distanceMeters) {
    if (distanceMeters == null || Number.isNaN(distanceMeters)) return '—';

    if (distanceMeters < 1000) {
        return `${Math.round(distanceMeters)} m`;
    }

    return `${(distanceMeters / 1000).toFixed(2)} km`;
}

export function formatDurationSeconds(seconds) {
    if (seconds == null || Number.isNaN(seconds)) return '—';

    const mins = Math.round(seconds / 60);

    if (mins < 60) {
        return `~${mins} min`;
    }

    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;

    if (remainingMins === 0) {
        return `~${hours} hr`;
    }

    return `~${hours} hr ${remainingMins} min`;
}