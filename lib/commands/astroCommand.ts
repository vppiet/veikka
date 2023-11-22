import {PrivMsgEvent} from '../../types/irc-framework';
import {format, formatISO, parse} from 'date-fns';

import {Context} from '../util';
import {Command} from '../command';
import {ApiError, Astro, BASE_URL, LOCATION_NOT_FOUND_ERROR,
    MOON_PHASES_EN_FI} from './resources/weatherApi';

const DATE_FORMAT = 'dd.MM.yyyy';
const TIME_FORMAT_12H = 'hh:mm aa';
const TIME_FORMAT_24H = 'HH:mm';
const UP_ARROW = '\u2191';
const DOWN_ARROW = '\u2193';

function format12To24h(time: string) {
    if (time.startsWith('No')) {
        return '-';
    }

    return format(parse(time, TIME_FORMAT_12H, new Date()), TIME_FORMAT_24H);
}

class AstroCommand extends Command {
    constructor() {
        super('.', 'astro', [
            '.astro <paikkakunta>',
            'Hae kuun ja auringon tiedot paikkakunnan perusteella.' +
            'Tiedot kuluvan päivän alusta (klo 00:00), joten esim. kuun valaistumisaste voi' +
            'erota nykyhetkestä.',
        ], 1, 1);
    }

    getEventName() {
        return 'privmsg';
    }

    async listener(this: Context<AstroCommand>, event: PrivMsgEvent) {
        const cmd = this.listener;

        if (!cmd.match(event.message)) return;

        const {req} = cmd.parseParameters(event.message);
        if (!req[0]) {
            event.reply(cmd.createSay('Anna paikkakunta.'));
        }

        const location = req[0];

        const url = `${BASE_URL}/astronomy.json?key=${Bun.env['WEATHER_API_KEY']}` +
            `&q=${encodeURIComponent(location)}`;
        const response = await fetch(url);

        if (!response.ok) {
            const body = await response.json<ApiError>();

            if (body.error.code === LOCATION_NOT_FOUND_ERROR) {
                event.reply(cmd.createSay('Paikkakuntaa ei löydetty.'));
            } else {
                event.reply(cmd.createSay('Jokin meni vikaan 8=D', `Koodi: ${body.error.code}`));
            }

            return;
        }

        const body = await response.json<Astro>();
        const astro = body.astronomy.astro;

        const sunrise = astro.sunrise === astro.sunset ? '-' : format12To24h(astro.sunrise);
        const sunset = astro.sunset === astro.sunrise ? '-' : format12To24h(astro.sunset);
        const moonrise = astro.moonrise === astro.moonset ? '-' : format12To24h(astro.moonrise);
        const moonset = astro.moonset === astro.moonrise ? '-' : format12To24h(astro.moonset);

        event.reply(cmd.createSay(
            `${body.location.name}, ${body.location.country}`,
            `Aurinko: ${UP_ARROW}${sunrise} ${DOWN_ARROW}${sunset}`,
            `Kuu: ${MOON_PHASES_EN_FI[astro.moon_phase].toLowerCase()} ` +
                `(${astro.moon_illumination} %) ` +
                `${UP_ARROW}${moonrise} ${DOWN_ARROW}${moonset}`,
            `${format(new Date(), DATE_FORMAT)} 00:00`,
        ));
    }
}

export {AstroCommand};
