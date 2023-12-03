import {format, parse} from 'date-fns';
import {PrivMsgEvent} from '../../types/irc-framework';
import {round} from 'lodash';

import {Veikka} from 'veikka';
import {Command, Params} from '../command';
import {getMoonIllumination} from './resources/moon';

const DATETIME_FORMAT = 'd.M.yyyy \'klo\' HH:mm';

class MoonCommand extends Command {
    constructor() {
        super('.', 'kuu', [
            '.kuu [pvämäärä]',
            'Näytä tämän hetkinen tai tietyn ajankohdan (muodossa pp.kk.vvvv klo tt:ss) ' +
                'kuun valaistumisaste.',
            'Esim: ".kuu"',
            'Esim. ".kuu 2.12.2023 klo 21:13"',
        ], 0, 1);
    }

    eventHandler(event: PrivMsgEvent, params: Params, client: Veikka) {
        let now = true;
        let date = new Date();

        const parsedDate = parse(params.opt[0], DATETIME_FORMAT, new Date());
        if (!Number.isNaN(parsedDate.getTime())) {
            date = parsedDate;
            now = false;
        }

        const ill = getMoonIllumination(date);
        const illPercent = round(ill * 100, 1);

        event.reply(this.createSay(
            `${illPercent} % kuun pinta-alasta on valaistu ajankohtana ` +
                format(date, DATETIME_FORMAT),
        ));
    }
}

export {MoonCommand};
