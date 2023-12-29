const GEO_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

interface GeoCodingResponse {
    results: Location[];
    generationtime_ms: number;
}

interface Location {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
    feature_code: string;
    country_code: string;
    country: string;
    population: number;
    postcodes?: string[];
    admin1: string;
    admin2: string;
    admin3?: string;
    admin4?: string;
    admin1_id: number;
    admin2_id: number;
    admin3_id?: number;
    admin4_id?: number;
}

async function getGeoCoding(name: string): Promise<{value: GeoCodingResponse} | {error: string}> {
    const url = `${GEO_BASE_URL}?name=${encodeURIComponent(name)}`;
    const response = await fetch(url);
    if (!response.ok) {
        return {
            error:
                `Could not fetch geocoding for "${name}".` +
                `Open-Meteo responded with status ${response.status}`,
        };
    }

    const value: GeoCodingResponse = await response.json();

    return {value};
}

export {getGeoCoding};
export type {GeoCodingResponse, Location};
