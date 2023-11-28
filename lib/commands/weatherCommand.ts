import {PrivMsgEvent} from 'irc-framework';

import {Command, Params} from '../command';
import {ApiError, BASE_URL, Coordinates, CurrentWeather, KPH_TO_MPS_MULTIPLIER,
    LOCATION_NOT_FOUND_ERROR} from './resources/weatherApi';
import {fromUnixTime} from 'date-fns';
import {format} from 'date-fns-tz';

class CurrentWeatherCommand extends Command {
    constructor() {
        super('.', 'sää', [
            '.sää <paikkakunta>',
            'Hae paikkakunnan sääolosuhteet.',
        ], 1);
    }

    async eventHandler(event: PrivMsgEvent, params: Params) {
        const query = params.req[0];

        const url = `${BASE_URL}/current.json?key=${Bun.env['WEATHER_API_KEY']}` +
            `&q=${encodeURIComponent(query)}`;
        const response = await fetch(url);

        if (!response.ok) {
            const body = await response.json<ApiError>();
            this.logger.error('Weather API responded with an error: %o', body);

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

        // fix some anomalies with weatherapi.com
        // - when location is in Oulu region
        const region = body.location.region === 'Oulu' ?
            'North Ostrobothnia' :
            body.location.region;

        // - when query contains a or o with umlaut for Finland
        const country = ['Финляндия', 'Finnland', 'Finlande'].includes(body.location.country) ?
            'Finland' :
            body.location.country;

        const location = [body.location.name, region, country]
            .filter((l) => l)
            .join(', ');

        const coordinates = new Coordinates(body.location.lat, body.location.lon).getISO();
        const lastUpdatedUTC = fromUnixTime(body.current.last_updated_epoch);
        const lastUpdated = format(lastUpdatedUTC, 'd.M.yyyy HH:mm',
            {timeZone: Bun.env.TZ || 'Europe/Helsinki'});

        event.reply(this.createSay(
            location,
            `${body.current.temp_c} °C (${body.current.feelslike_c} °C)`,
            `${windMps} m/s (${gustMps} m/s)`,
            body.current.humidity + ' %',
            body.current.pressure_mb + ' mbar',
            body.current.precip_mm + ' mm',
            body.current.condition.text,
            coordinates,
            lastUpdated,
        ));
    }
}

export {CurrentWeatherCommand};
