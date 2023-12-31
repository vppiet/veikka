import {isType} from '../../util';

const GEO_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

interface GeoCodingResponse {
    results?: Location[];
    generationtime_ms: number;
}

interface Location {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    feature_code: string;
    country_code: string;
    admin1_id?: number;
    admin2_id?: number;
    admin3_id?: number;
    admin4_id?: number;
    timezone: string;
    country_id: number;
    country: string;
    population?: number;
    postcodes?: string[];
    admin1?: string;
    admin2?: string;
    admin3?: string;
    admin4?: string;
}

async function getGeoCoding(name: string) {
    const url = `${GEO_BASE_URL}?name=${encodeURIComponent(name)}&count=1&lang=en&format=json`;
    const response = await fetch(url);
    if (!response.ok) {
        return {
            error:
                `Could not fetch geocoding for "${name}".` +
                `Open-Meteo responded with status ${response.status}`,
        };
    }

    const r = await response.json();
    if (isType<GeoCodingResponse>(r, ['generationtime_ms'])) {
        return {value: r};
    }

    return {error: 'Response body was not of the expected type'};
}

function decodeGeoCodingResponse(jsonString: string) {
    const parseResult: unknown = JSON.parse(jsonString);
    if (isType<GeoCodingResponse>(parseResult, ['generationtime_ms'])) {
        return {value: parseResult};
    }

    return {error: 'Decoding error from json string to GeoCodingResponse'};
}

export {decodeGeoCodingResponse, getGeoCoding};
export type {GeoCodingResponse, Location};
