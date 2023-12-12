import {PrivMsgEvent} from '../../types/irc-framework';
import {parse, addDays} from 'date-fns';

import {ARG_SEP, Command} from '../command';
import {Veikka} from 'veikka';
import {DATE_FORMAT} from './resources/time';

const UP_ARROW = '\u2191';
const DOWN_ARROW = '\u2193';

const DAY_DELTAS: Readonly<Record<string, number>> = {
    'eilen': -1,
    'tänään': 0,
    'huomenna': 1,
    'ylihuomenna': 2,
};

class SunCommand extends Command {
    constructor() {
        super('.', 'aurinko', [
            '.aurinko <paikkakunta> [päivämäärä]',
            'Hakee auringonnousun ja -laskun kellonajat paikkakunnan ja ajankohdan perusteella.' +
                ' Jos ajankohta on tyhjä, komento palauttaa tämän päivän tiedot.',
        ]);
    }

    async eventHandler(event: PrivMsgEvent, client: Veikka) {
        const now = new Date();
        const result = this.parseArguments(event.message, now);
        // TODO: astronomical -> solarEquation
        event.reply('TODO: implement astronomical algorithms in TypeScript');
    }

    parseArguments(msg: string, referenceDate: Date) {
        const parts = this.getMsgParts(msg);
        let location = parts[0];

        if (!location) {
            return {error: 'Paikkakunta puuttuu'};
        }

        const dateParts = [];

        for (let i = 1; i < parts.length; i++) {
            if (!Number.isNaN(Number(parts[i][0])) || parts[i] in DAY_DELTAS) {
                dateParts.push(parts[i]);
            }

            if (!dateParts.length) {
                location += ARG_SEP + parts[i];
            }
        }

        if (!dateParts.length) {
            return {location};
        }

        const dateString = dateParts.join(ARG_SEP);
        const dateParseResult = this.parseDateArgument(dateString, referenceDate);

        if ('error' in dateParseResult) {
            return {error: dateParseResult.error};
        }

        return {location, date: dateParseResult.value};
    }

    parseDateArgument(dateString: string, referenceDate: Date) {
        if (dateString in DAY_DELTAS) {
            const deltaDays = DAY_DELTAS[dateString];
            const date = addDays(referenceDate, deltaDays);
            return {value: date};
        }

        const date = parse(dateString, DATE_FORMAT, referenceDate);

        if (Number.isNaN(date.getTime())) {
            return {error: `Annettua päivämäärää (${dateString}) ei pystytty tulkitsemaan.` +
                ` Tarkista ".ohje ${this.getPrefixedName()}".`};
        }

        return {value: date};
    }
}

export {SunCommand};
