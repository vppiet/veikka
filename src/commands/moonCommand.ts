import {format, isBefore, isValid} from 'date-fns';
import {PrivMsgEvent} from 'irc-framework';

import {Body, Observer, SearchRiseSet} from 'astronomy-engine';
import {Command} from '../command';
import {CommandParam} from '../commandParam';
import {parseDateTimeOrDayDelta} from '../commandParamParsers/dateParam';
import {parseStringTail} from '../commandParamParsers/stringParam';
import {LOCATION_SERVICE_ID, LocationService} from '../services/locationService';
import {DOWN_ARROW, UP_ARROW} from '../util';
import {Veikka} from '../veikka';
import {getMoonIlluminationPercentage, getMoonPhaseString} from './resources/astronomical';
import {DATETIME_FORMAT} from './resources/time';

class MoonCommand extends Command<[Date | undefined, string | undefined]> {
    constructor() {
        super('.', 'kuu', ['.kuu [aikamääre] [paikka]'], [dateTimeParam, locationParam]);
    }

    async eventHandler(
        event: PrivMsgEvent,
        params: [Date | undefined, string | undefined],
        client: Veikka
    ) {
        const [dateParam, locationParam] = params;
        const date = dateParam ?? new Date();

        if (locationParam) {
            const ls = client.getService<LocationService>(LOCATION_SERVICE_ID);
            if (!ls) {
                this.reply(event, 'Sisäinen virhe :< (LocationService is not initialised)');
                return;
            }

            const locationResult = await ls.getLocation(locationParam);
            if ('error' in locationResult) {
                this.reply(event, `Sisäinen virhe :< (${locationResult.error})`);
                return;
            }

            const {name, country, latitude, longitude, elevation} = locationResult.value;
            const observer = new Observer(latitude, longitude, elevation);

            const moonRiseSearch = SearchRiseSet(Body.Moon, observer, 1, date, 1);
            const moonRise = {
                symbol: UP_ARROW,
                date: moonRiseSearch?.date ?? new Date(NaN),
                dateString: '',
            };

            const moonSetSearch = SearchRiseSet(Body.Moon, observer, -1, date, 1);
            const moonSet = {
                symbol: DOWN_ARROW,
                date: moonSetSearch?.date ?? new Date(NaN),
                dateString: '',
            };

            const moonRiseSetArr = [moonRise, moonSet].sort((a, b) => {
                if (isValid(a.date) && isValid(b.date)) {
                    return isBefore(a.date, b.date) ? -1 : 1;
                }

                return 0;
            });
            moonRiseSetArr.forEach((e) => {
                if (isValid(e.date)) {
                    e.dateString = format(e.date, 'H:mm');
                } else {
                    e.dateString = 'Error';
                }
            });

            this.reply(
                event,
                `${moonRiseSetArr[0].symbol}${moonRiseSetArr[0].dateString}` +
                    ` ${moonRiseSetArr[1].symbol}${moonRiseSetArr[1].dateString}`,
                `${name}, ${country}`
            );
        } else {
            const phaseString = getMoonPhaseString(date);

            const illumination = getMoonIlluminationPercentage(date);
            const illString = `${illumination} % valaistuneena`;

            const dateString = format(date, DATETIME_FORMAT);

            this.reply(event, phaseString, illString, dateString);
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
