/**
 * Utility for fetching live geolocation and reverse geocoding to a human-readable address.
 */

export interface LocationData {
    address: string;
    latitude: number;
    longitude: number;
}

/**
 * Gets the current live location of the user.
 * Falls back to just coordinates if reverse geocoding fails.
 */
export async function getCurrentLiveLocation(): Promise<string> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn('[Location] Geolocation not supported');
            resolve('');
            return;
        }

        // Set a timeout for the coordinate fetch itself
        const geoTimeout = setTimeout(() => {
            console.warn('[Location] GPS Timeout');
            resolve('');
        }, 8000);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                clearTimeout(geoTimeout);
                const { latitude, longitude } = position.coords;
                console.log(`[Location] Coordinates: ${latitude}, ${longitude}`);

                try {
                    // Reverse geocode using Nominatim
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                        {
                            headers: {
                                'Accept-Language': 'en',
                                'User-Agent': 'InsuranceApp/1.1'
                            }
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data.display_name) {
                            resolve(data.display_name);
                            return;
                        }
                    }

                    // Fallback to coordinates
                    resolve(`GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                } catch (error) {
                    console.error('[Location] Geocoding error:', error);
                    resolve(`GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                }
            },
            (error) => {
                clearTimeout(geoTimeout);
                console.warn('[Location] GPS Error:', error.message);
                resolve('');
            },
            {
                enableHighAccuracy: true,
                timeout: 7000,
                maximumAge: 30000 // Accept a 30s old position to speed up
            }
        );
    });
}
