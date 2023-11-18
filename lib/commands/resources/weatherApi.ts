type ApiError = {
    error: {
        code: number;
        message: string;
    };
};

type Location = {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
};

type CurrentWeather = {
    location: Location;
    current: {
        last_updated_epoch: number;
        last_updated: string;
        temp_c: number;
        is_day: number;
        condition: {
          text: string;
          code: number;
        };
        wind_kph: number;
        wind_degree: number;
        wind_dir: string;
        pressure_mb: number;
        precip_mm: number;
        humidity: number;
        cloud: number;
        feelslike_c: number;
        vis_km: number;
        uv: number;
        gust_kph: number;
    };
};

type Astro = {
    location: Location;
    astronomy: {
        astro: {
            sunrise: string;
            sunset: string;
            moonrise: string;
            moonset: string;
            moon_phase: string;
            moon_illumination: number;
        }
    }
};

const MOON_PHASES_EN_FI: Record<string, string> = {
    'New Moon': 'Uusi kuu',
    'Waxing Crescent': 'Kasvava sirppi',
    'First Quarter': 'Ensimmäinen neljännes',
    'Waxing Gibbous': 'Kasvava kupera kuu',
    'Full Moon': 'Täysikuu',
    'Waning Gibbous': 'Vähenevä kupera kuu',
    'Last Quarter': 'Viimeinen neljännes',
    'Waning Crescent': 'Vähenevä sirppi',
};
const LOCATION_NOT_FOUND_ERROR = 1006;
const KPH_TO_MPS_MULTIPLIER = 5/18;
const BASE_URL = 'https://api.weatherapi.com/v1';

export {
    ApiError,
    Location,
    CurrentWeather,
    Astro,
    MOON_PHASES_EN_FI,
    LOCATION_NOT_FOUND_ERROR,
    KPH_TO_MPS_MULTIPLIER,
    BASE_URL,
};
