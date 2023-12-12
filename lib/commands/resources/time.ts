import {addDays, parse} from 'date-fns';

const DATE_WO_YEAR_FORMAT = 'd.M.';
const DATE_FORMAT = 'd.M.yyyy';
const DATETIME_FORMAT = 'd.M.yyyy \'klo\' HH:mm';
const TIME_FORMAT_24H = 'HH:mm';

const INTERVAL: Readonly<Record<string, number>> = {
    MINUTE: 1000 * 60,
    HOUR: 1000 * 60 * 60,
};

const DAY_DELTAS: Readonly<Record<string, number>> = {
    'eilen': -1,
    'tänään': 0,
    'huomenna': 1,
    'ylihuomenna': 2,
};

function getDateFromDayDelta(name: string, defaultDate: Date, time?: string) {
    if (!(name in DAY_DELTAS)) {
        return {error: `Aikamäärettä "${name}" ei voitu tulkita`};
    }

    const dayDelta = DAY_DELTAS[name];
    const dayDeltaTime = time ? parse(time, TIME_FORMAT_24H, defaultDate) : defaultDate;

    if (Number.isNaN(dayDeltaTime.getTime())) {
        return {error: `Kellonaikaa "${time}" ei voitu tulkita`};
    }

    const date = addDays(defaultDate, dayDelta);
    date.setHours(dayDeltaTime.getHours());
    date.setMinutes(dayDeltaTime.getMinutes());

    return {value: date};
}

export {
    DATE_WO_YEAR_FORMAT,
    DATE_FORMAT,
    DATETIME_FORMAT,
    TIME_FORMAT_24H,
    INTERVAL,
    DAY_DELTAS,
    getDateFromDayDelta,
};
