import {PrivMsgEvent} from 'irc-framework';
import {round} from 'lodash';

import {Command} from '../command';
import {CommandParam} from '../commandParam';
import {SUPPORTED_CHARS, SYMBOLS, calculate} from './resources/mathematical';

class CalculateCommand extends Command<string | number> {
    constructor() {
        super('.', 'laske', [
            '.laske <lauseke> .[desimaalit]',
            'Laske matemaattinen lauseke.',
            'Esim: .laske 1.1+2*(3/4)^pi .3',
            `Tuetut kirjaimet: "${SUPPORTED_CHARS}"`,
            `Tuetut symbolit: ${Object.keys(SYMBOLS).map((s) => '"' + s + '"').join(', ')}`,
        ], [expressionParam, decimalParam]);
    }

    eventHandler(event: PrivMsgEvent, args: [string, number]) {
        const [expression, decimalPlaces] = args;
        const {error, result} = calculate(expression);

        if (error) {
            this.reply(event, error);
        } else if (result) {
            const rounded = round(result, decimalPlaces || 2);
            this.reply(event,
                `${expression} = ${String(result) === String(rounded) ?
                    result :
                    '~' + rounded}`);
        }
    }
}

const expressionParam: CommandParam<string> = {
    required: true,
    parse: function(parts: string[]) {
        let exp = '';
        const consumed: string[] = [];

        for (const part of parts) {
            if (!part.startsWith('.')) {
                exp += part;
                consumed.push(part);
            }
        }

        if (!exp.length) {
            return {error: 'Lauseke puuttuu'};
        }

        return {value: exp, consumed};
    },
};

const decimalParam: CommandParam<number> = {
    required: false,
    parse: function(parts: string[]) {
        if (parts.length > 0 && parts[0].startsWith('.')) {
            const decimalPlaces = Number.parseInt(parts[0][1]);
            if (!Number.isNaN(decimalPlaces)) {
                return {value: decimalPlaces, consumed: [parts[0]]};
            }
        }

        return {error: 'Desimaalit tulisi antaa muodossa ".n" (esim. .laske pi^2 .3)'};
    },
};

export {CalculateCommand};
