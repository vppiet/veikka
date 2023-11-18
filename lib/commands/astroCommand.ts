import {Context} from '../util';
import {PrivMsgEvent} from '../../types/irc-framework';
import {Command} from '../command';
import {ApiError, Astro, BASE_URL, LOCATION_NOT_FOUND_ERROR,
    MOON_PHASES_EN_FI} from './resources/weatherApi';
import {format, formatISO, parse} from 'date-fns';

const DATE_FORMAT = 'dd.MM.yyyy';
const TIME_FORMAT_12H = 'hh:mm aa';
const TIME_FORMAT_24H = 'HH:mm';

function format12To24h(time: string) {
    return format(parse(time, TIME_FORMAT_12H, new Date()), TIME_FORMAT_24H);
}

class AstroCommand extends Command {
    constructor() {
        super('.', 'astro', [
            '.astro <paikkakunta> [pvämäärä]',
            'Hae kuun ja auringon tiedot paikkakunnan ja päivämäärän perusteella. ' +
            'Jos päivämäärää ei anneta, käytetään nykyistä päivämäärää.',
            'Aika-argumentti on oltava muodossa "18.11.2023".',
        ], 1, 1);
    }

    getEventName() {
        return 'privmsg';
    }

    async listener(this: Context<AstroCommand>, event: PrivMsgEvent) {
        const cmd = this.listener;

        if (!cmd.match(event.message)) return;

        const {req, opt} = cmd.parseParameters(event.message);
        if (!req[0]) {
            event.reply(cmd.createSay('Anna paikkakunta.'));
        }

        const location = req[0];
        const date = opt[0] ? parse(opt[0], DATE_FORMAT, new Date()) : new Date();
        if (Number.isNaN(date.getTime())) {
            event.reply(cmd.createSay('Päivämäärää ei pystytty tulkitsemaan :|'));
            return;
        }

        const url = `${BASE_URL}/astronomy.json?key=${Bun.env['WEATHER_API_KEY']}` +
            `&q=${encodeURIComponent(location)}` +
            `&dt=${formatISO(date, {representation: 'date'})}`;
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
        event.reply(cmd.createSay(
            `${body.location.name}, ${body.location.country}`,
            `${format(date, DATE_FORMAT)} 00:00`,
            `Aurinko: \u2191${format12To24h(astro.sunrise)} \u2193${format12To24h(astro.sunset)}`,
            `Kuu: ${MOON_PHASES_EN_FI[astro.moon_phase].toLowerCase()} ` +
                `(${astro.moon_illumination} %) ` +
                `\u2191${format12To24h(astro.moonrise)} \u2193${format12To24h(astro.moonset)}`,
        ));
    }
}

export {AstroCommand};
