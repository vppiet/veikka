import {Body, Illumination, MoonPhase} from 'astronomy-engine';
import {format} from 'date-fns';
import {PrivMsgEvent} from 'irc-framework';
import round from 'lodash.round';

import {Command} from '../command';
import {CommandParam} from '../commandParam';
import {parseDateTimeOrDayDelta} from '../commandParamParsers/dateParam';
import {parseStringTail} from '../commandParamParsers/stringParam';
import {DATETIME_FORMAT} from './resources/time';

class MoonCommand extends Command<[Date | undefined, string | undefined]> {
    constructor() {
        super('.', 'kuu', [
            '.kuu [aikamääre]',
        ], [dateTimeParam, locationParam]);
    }

    eventHandler(event: PrivMsgEvent, params: [Date | undefined, string | undefined]) {
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
    name: 'paikkakunta',
    required: false,
    parse: parseStringTail,
} as const;

function getMoonIlluminationPercentage(date: Date) {
    const {phase_fraction} = Illumination(Body.Moon, date);
    return round(phase_fraction * 100, 1);
}

const MOON_PHASES: Readonly<{angle: number, description: string}[]> = [
    {angle: 0, description: 'Uusi kuu'},
    {angle: 45, description: 'Kasvava sirppi'},
    {angle: 90, description: 'Ensimmäinen neljännes'},
    {angle: 135, description: 'Kasvava kupera kuu'},
    {angle: 180, description: 'Täysikuu'},
    {angle: 225, description: 'Vähenevä kupera kuu'},
    {angle: 270, description: 'Viimeinen neljännes'},
    {angle: 315, description: 'Vähenevä sirppi'},
];

function getMoonPhaseString(date: Date) {
    const currentPhase = MoonPhase(date);

    const mp = MOON_PHASES.find((mp, i) => {
        if (i === MOON_PHASES.length - 1 && currentPhase >= MOON_PHASES[i].angle) {
            return true;
        } else if (currentPhase >= mp.angle && currentPhase < MOON_PHASES[i + 1].angle) {
            return true;
        }

        return false;
    });

    return mp?.description ?? 'Error determining moon phase';
}

export {MoonCommand};
