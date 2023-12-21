import {round} from 'lodash';

interface ApiError {
    error: {
        code: number;
        message: string;
    };
}

interface Location {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
}

interface CurrentWeather {
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
}

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

    static parse(value: number, type?: CoordinateType) {
        if (Number.isNaN(value)) {
            throw new TypeError(`Required value was ${value}`);
        }

        if (!type) {
            throw new TypeError(`Required type was ${type}`);
        }

        const absValue = Math.abs(value);

        if (absValue > 180) {
            throw new TypeError(`Value was ${value} and exceeds possible -/+180 degrees`);
        }

        const positive = value >= 0;

        const degrees = Math.trunc(absValue);
        const minutes = Math.trunc(absValue % 1 * 60);
        const seconds = round((absValue % 1 * 60) % 1 * 60, 3);

        return new CoordinatePoint(absValue, type, positive, degrees, minutes, seconds);
    }

    getISO() {
        // https://en.wikipedia.org/wiki/ISO_6709#Representation_at_the_human_interface_(Annex_D)
        const d = this.degrees + '°';
        const m = pad(this.minutes) + '′';
        const s = pad(round(this.seconds, 3)) + '″';
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
    BASE_URL,
    CoordinatePoint,
    CoordinateType,
    Coordinates,
    CurrentWeather,
    KPH_TO_MPS_MULTIPLIER,
    LOCATION_NOT_FOUND_ERROR,
    Location
};
