import {format} from 'date-fns';
import {PrivMsgEvent} from 'irc-framework';
import {round} from 'lodash';

import {Command} from '../command';
import {CommandParam} from '../commandParam';
import {parseDateTime} from '../commandParamParsers/dateParam';
import {getMoonIllumination} from './resources/moon';
import {DATETIME_FORMAT} from './resources/time';

class MoonCommand extends Command<Date> {
    constructor() {
        super('.', 'kuu', [
            '.kuu [aikamääre]',
            'Näytä tämänhetkinen tai tietyn ajankohdan (15.10.1582 jälkeen)' +
                ' kuun valaistumisaste prosentteina.',
            'Esim. ".kuu", ".kuu 2.12.2023 klo 21:13", ".kuu huomenna"',
        ], [dateTimeParam]);
    }

    eventHandler(event: PrivMsgEvent, params: [Date]) {
        const date = params[0] ?? new Date();

        const ill = getMoonIllumination(date);
        const illPercent = round(ill * 100, 1);

        this.reply(event, `${illPercent} % valaistuneena`, format(date, DATETIME_FORMAT));
    }
}

const dateTimeParam: CommandParam<Date> = {
    name: 'aikamääre',
    required: false,
    parse: parseDateTime,
};

export {MoonCommand};
