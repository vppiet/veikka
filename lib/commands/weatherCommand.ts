import {getLogger} from 'logger';
import {Logger} from 'winston';
import {PrivMsgEvent} from 'irc-framework';

import {Context} from '../util';
import {Command} from '../command';
import {ApiError, BASE_URL, CurrentWeather, KPH_TO_MPS_MULTIPLIER,
    LOCATION_NOT_FOUND_ERROR} from './resources/weatherApi';

class CurrentWeatherCommand extends Command {
    logger: Logger;

    constructor() {
        super('.', 'sää', [
            '.sää <paikkakunta>',
            'Hae paikkakunnan sääolosuhteet.',
        ], 1);
        this.logger = getLogger('weatherCommand');
    }

    getEventName(): string {
        return 'privmsg';
    }

    async listener(this: Context<CurrentWeatherCommand>, event: PrivMsgEvent) {
        const cmd = this.listener;

        if (!cmd.match(event.message)) return;

        const {req} = cmd.parseParameters(event.message);
        const location = req[0];

        const url = `${BASE_URL}/current.json?key=${Bun.env['WEATHER_API_KEY']}` +
            `&q=${encodeURIComponent(location)}` +
            '&aqi=no&lang=fi';
        const response = await fetch(url);

        if (!response.ok) {
            const body = await response.json<ApiError>();
            cmd.logger.error('Weather API responded with an error: %o', body);

            if (body.error.code === LOCATION_NOT_FOUND_ERROR) {
                event.reply('Sää | Paikkakuntaa ei löydetty.');
            } else {
                event.reply(`Sää | Jokin meni vikaan 8=D | Koodi: ${body.error.code}`);
            }

            return;
        }

        const body = await response.json<CurrentWeather>();
        const windMps = (body.current.wind_kph * KPH_TO_MPS_MULTIPLIER).toFixed(1);
        const gustMps = (body.current.gust_kph * KPH_TO_MPS_MULTIPLIER).toFixed(1);
        event.reply(cmd.createSay(
            `${body.location.name}, ${body.location.region}, ${body.location.country}`,
            `${body.location.lat}°, ${body.location.lon}°`,
            `${body.current.temp_c} °C (${body.current.feelslike_c} °C)`,
            `${windMps} m/s (${gustMps} m/s)`,
            `${body.current.humidity} %`,
            `${body.current.pressure_mb} mbar`,
            `${body.current.precip_mm} mm`,
            `${body.current.condition.text}`));
    }
}

export {CurrentWeatherCommand};
