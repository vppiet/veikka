import {format} from 'date-fns';
import {PrivMsgEvent} from 'irc-framework';

import {Command} from '../command';
import {CommandParam} from '../commandParam';
import {parseDateTimeOrDayDelta} from '../commandParamParsers/dateParam';
import {parseStringTail} from '../commandParamParsers/stringParam';
import {LOCATION_SERVICE_ID, LocationService} from '../services/locationService';
import {Veikka} from '../veikka';
import {getMoonIlluminationPercentage, getMoonPhaseString} from './resources/astronomical';
import {DATETIME_FORMAT} from './resources/time';

class MoonCommand extends Command<[Date | undefined, string | undefined]> {
    constructor() {
        super('.', 'kuu', [
            '.kuu [aikamääre] [paikka]',
        ], [dateTimeParam, locationParam]);
    }

    eventHandler(event: PrivMsgEvent, params: [Date | undefined, string | undefined],
        client: Veikka) {
        const [dateParam] = params;
        const date = dateParam ?? new Date();

        const phaseString = getMoonPhaseString(date);

        const illumination = getMoonIlluminationPercentage(date);
        const illString = `${illumination} % valaistuneena`;

        const dateString = format(date, DATETIME_FORMAT);

        this.reply(event,
            phaseString,
            illString,
            dateString,
        );

        const ls = client.getService<LocationService>(LOCATION_SERVICE_ID);
        if (!ls) {
            this.reply(event, 'Necessary services were not initialised');
        }
        
    }
}

const dateTimeParam: CommandParam<Date> = {
    name: 'aikamääre',
    required: false,
    parse: (parts: string[]) => {
        const now = new Date();
        return parseDateTimeOrDayDelta(parts, now);
    },
} as const;

const locationParam: CommandParam<string> = {
    name: 'paikka',
    required: false,
    parse: parseStringTail,
} as const;

export {MoonCommand};
