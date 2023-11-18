import {PrivMsgEvent} from 'irc-framework';

import {SUPPORTED_CHARS, SYMBOLS, calculate} from './resources/calculation';
import {Command} from '../command';
import {Context} from '../util';

function round(value: number, decPlaces = 2) {
    // max supported decimal places
    if (decPlaces > 10) decPlaces = 10;

    // num->str->num->str->num, ehh... good for now
    const str = String(value) + 'e' + decPlaces;
    const num = Math.round(Number(str));
    return Number(String(num) + 'e' + -decPlaces);
}

class CalculateCommand extends Command {
    constructor() {
        super('.', 'laske', [
            '.laske <lauseke>, [pyöristys]',
            'Laske matemaattinen lauseke.',
            `Tuetut kirjaimet: "${SUPPORTED_CHARS}"`,
            `Tuetut symbolit: ${Object.keys(SYMBOLS).map((s) => '"' + s + '"').join(', ')}`,
        ], 1, 1);
    }

    getEventName(): string {
        return 'privmsg';
    }

    listener(this: Context<CalculateCommand>, event: PrivMsgEvent): void {
        if (!this.listener.match(event.message)) return;

        const {req, opt} = this.listener.parseParameters(event.message);

        const input = req[0];
        const {result, error} = calculate(input);

        if (result) {
            const decimalPlaces = Number.isNaN(Number.parseInt(opt[0])) ? undefined :
                Number.parseInt(opt[0]);
            const rounded = round(result, decimalPlaces);
            event.reply(`Laske | ${input} = ` +
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
