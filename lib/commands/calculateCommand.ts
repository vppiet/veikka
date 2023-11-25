import {PrivMsgEvent} from 'irc-framework';

import {SUPPORTED_CHARS, SYMBOLS, calculate} from './resources/calculation';
import {Command, Params} from '../command';
import {round} from '../util';

class CalculateCommand extends Command {
    constructor() {
        super('.', 'laske', [
            '.laske <lauseke>, [pyöristys]',
            'Laske matemaattinen lauseke.',
            `Tuetut kirjaimet: "${SUPPORTED_CHARS}"`,
            `Tuetut symbolit: ${Object.keys(SYMBOLS).map((s) => '"' + s + '"').join(', ')}`,
        ], 1, 1);
    }

    eventHandler(event: PrivMsgEvent, params: Params): void {
        const expression = params.req[0];
        const {result, error} = calculate(expression);

        if (result) {
            const decimalPlaces = Number.isNaN(Number.parseInt(params.opt[0])) ? undefined :
                Number.parseInt(params.opt[0]);
            const rounded = round(result, decimalPlaces);
            event.reply(`Laske | ${expression} = ` +
                `${String(result) === String(rounded) ? result : '~' + rounded}`);
        } else {
            event.reply('Laske | Nyt meni jotain vikaan. | ' +
                `Tuetut kirjaimet: "${SUPPORTED_CHARS}" | ` +
                `Tuetut symbolit: ${Object.keys(SYMBOLS).map((s) => '"' + s + '"').join(', ')}` +
                (error ? ` | ${error}` : ''));
        }
    }
}

export {CalculateCommand};
