import {fromUnixTime} from 'date-fns';
import {format} from 'date-fns-tz';
import {PrivMsgEvent} from 'irc-framework';

import {Command} from '../command';
import {CommandParam} from '../commandParam';
import {parseStringTail} from '../commandParamParsers/stringParam';
import {
    ApiError,
    BASE_URL,
    CurrentWeather,
    KPH_TO_MPS_MULTIPLIER,
    LOCATION_NOT_FOUND_ERROR,
} from './resources/weatherApi';

class CurrentWeatherCommand extends Command<[string]> {
    constructor() {
        super(
            '.',
            'sää',
            ['.sää <paikkakunta>', 'Hae paikkakunnan sääolosuhteet.'],
            [locationParam]
        );
    }

    async eventHandler(event: PrivMsgEvent, params: [string]) {
        const [location] = params;

        const url =
            `${BASE_URL}/current.json?key=${Bun.env.WEATHER_API_KEY}` +
            `&q=${encodeURIComponent(location)}`;
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

        // - when query contains a or o with umlaut for Finland
        const country = ['Финляндия', 'Finnland', 'Finlande'].includes(body.location.country)
            ? 'Finland'
            : body.location.country;

        const locationString = [body.location.name, country].filter((l) => l).join(', ');

        const lastUpdatedUTC = fromUnixTime(body.current.last_updated_epoch);
        const lastUpdated = format(lastUpdatedUTC, 'd.M.yyyy HH:mm', {
            timeZone: Bun.env.TZ ?? 'Europe/Helsinki',
        });

        event.reply(
            this.createSay(
                `${body.current.temp_c} °C (${body.current.feelslike_c} °C)`,
                `${windMps} m/s (${gustMps} m/s)`,
                body.current.humidity + ' %',
                body.current.pressure_mb + ' mbar',
                body.current.precip_mm + ' mm',
                body.current.condition.text,
                locationString,
                lastUpdated
            )
        );
    }
}

const locationParam: CommandParam<string> = {
    name: 'paikka',
    required: true,
    parse: parseStringTail,
} as const;

export {CurrentWeatherCommand};
