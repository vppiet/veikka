import {round} from '../../util';

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

const enum CoordinateType {
    Lat = 'latitude',
    Lon = 'longitude',
}

class CoordinatePoint {
    readonly raw: number;
    readonly type: CoordinateType;
    readonly positive: boolean;
    readonly degrees: number;
    readonly minutes: number;
    readonly seconds: number;

    constructor(raw: number, type: CoordinateType, positive = true,
        degrees = 0, minutes = 0, seconds = 0) {
        this.raw = raw;
        this.type = type;
        this.positive = positive;
        this.degrees = degrees;
        this.minutes = minutes;
        this.seconds = seconds;
    }

    static parse(value: number, type: CoordinateType) {
        if (Number.isNaN(value)) {
            throw new TypeError(`Required value was ${value}`);
        }

        if (Math.abs(value) > 180) {
            throw new TypeError(`Value was ${value} and exceeds possible -/+180 degrees`);
        }

        if (!type) {
            throw new TypeError(`Required type was ${type}`);
        }

        const positive = value >= 0;

        const degrees = Math.trunc(Math.abs(value));
        const minutes = Math.trunc(Math.abs(value) % 1 * 60);
        const seconds = (Math.abs(value) % 1 * 60) % 1 * 60;

        return new CoordinatePoint(value, type, positive, degrees, minutes, seconds);
    }

    getISO() {
        // https://en.wikipedia.org/wiki/ISO_6709#Representation_at_the_human_interface_(Annex_D)
        const d = this.degrees + '\u00B0';
        const m = this.minutes || this.seconds ? pad(this.minutes) + '\'' : '';
        const s = this.seconds ? pad(round(this.seconds, 3)) + '"' : '';
        const direction = this.type === CoordinateType.Lat ?
            (this.positive ? 'N' : 'S') :
            (this.positive ? 'E' : 'W');

        return d + m + s + direction;
    }
}

class Coordinates {
    readonly lat: CoordinatePoint;
    readonly lon: CoordinatePoint;

    constructor(lat: number, lon: number) {
        this.lat = CoordinatePoint.parse(lat, CoordinateType.Lat);
        this.lon = CoordinatePoint.parse(lon, CoordinateType.Lon);
    }

    getISO() {
        return this.lat.getISO() + ' ' + this.lon.getISO();
    }
}

function pad(value: number) {
    return value > -10 || value < 10 ? value.toString().padStart(2, '0') : value.toString();
}

export {
    ApiError,
    Location,
    CurrentWeather,
    Astro,
    MOON_PHASES_EN_FI,
    LOCATION_NOT_FOUND_ERROR,
    KPH_TO_MPS_MULTIPLIER,
    BASE_URL,
    CoordinateType,
    CoordinatePoint,
    Coordinates,
};
