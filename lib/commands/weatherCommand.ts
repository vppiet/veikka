import {Context} from '../util';
import {PrivMsgEvent} from '../../types/irc-framework';
import {Command, PRIVILEGE_LEVEL} from '../command';
import {getLogger} from 'logger';
import {Logger} from 'winston';

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

const LOCATION_NOT_FOUND = 1006;
const KPH_TO_MPS_MULTIPLIER = 5/18;
const BASE_URL = 'https://api.weatherapi.com/v1';

class WeatherCommand extends Command {
    logger: Logger;

    constructor() {
        super('.', 'sää', PRIVILEGE_LEVEL.USER, 1);
        this.logger = getLogger('weatherCommand');
    }

    getEventName(): string {
        return 'privmsg';
    }

    async listener(this: Context<WeatherCommand>, event: PrivMsgEvent) {
        if (!this.listener.match(event.message)) return;

        const {req} = this.listener.parseParameters(event.message);
        const url = `${BASE_URL}/current.json?key=${Bun.env['WEATHER_API_KEY']}` +
            `&q=${encodeURIComponent(req[0])}` +
            '&aqi=no&lang=fi';
        const response = await fetch(url);

        if (!response.ok) {
            const body = await response.json<ApiError>();
            this.listener.logger.error('Weather API responded with an error: %o', body);

            if (body.error.code === LOCATION_NOT_FOUND) {
                event.reply('Sää | Paikkaa ei löydetty.');
            } else {
                event.reply(`Sää | Jokin meni vikaan 8=D | Koodi: ${body.error.code}`);
            }

            return;
        }

        const body = await response.json<CurrentWeather>();
        const windMps = (body.current.wind_kph * KPH_TO_MPS_MULTIPLIER).toFixed(1);
        const gustMps = (body.current.gust_kph * KPH_TO_MPS_MULTIPLIER).toFixed(1);
        event.reply('Sää | ' +
            `${body.location.name}, ${body.location.country} | ` +
            `${body.current.temp_c} °C (${body.current.feelslike_c} °C) | ` +
            `${windMps} m/s (${gustMps} m/s) | ` +
            `${body.current.humidity} % | ` +
            `${body.current.pressure_mb} mbar | ` +
            `${body.current.precip_mm} mm | ` +
            `${body.current.condition.text}`);
    }
}

export {WeatherCommand};
