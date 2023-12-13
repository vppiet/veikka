import {parse} from 'date-fns';

import {
    DATE_FORMAT, DATE_WO_YEAR_FORMAT,
    TIME_24H_FORMAT, getDateFromDayDelta,
} from './commands/resources/time';
import {isNumber, objectKeys} from './util';

interface CommandParam<ReturnType> {
    required: boolean;
    parse(parts: string[]): {consumed: string[], value: ReturnType} | {error: string};
}

function parseDateTime(parts: string[], defaultDate: Date) {
    if (!parts.length) {
        return {error: 'Aikamääre puuttuu'};
    }

    const minutePrecDate = new Date(defaultDate);
    minutePrecDate.setSeconds(0);
    minutePrecDate.setMilliseconds(0);

    const consumed: string[] = [];

    if (!isNumber(parts[0][0])) {
        const name = parts[0];
        consumed.push(parts[0]);

        let time = parts[1];

        if (time) {
            consumed.push(parts[1]);
        }

        if (parts[1] === 'klo') {
            time = parts[2];
            consumed.push(parts[2]);
        }

        const result = getDateFromDayDelta(name, minutePrecDate, time);

        if (result.error) {
            return {error: result.error};
        } else if (result.value) {
            return {value: result.value, consumed};
        }
    } else {
        const dateString = parts[0];
        consumed.push(parts[0]);

        const dateWithoutYear = parse(dateString, DATE_WO_YEAR_FORMAT, minutePrecDate);
        const dateWithYear = parse(dateString, DATE_FORMAT, minutePrecDate);

        let date: Date;
        if (isNumber(dateWithoutYear.getTime())) {
            date = dateWithoutYear;
        } else if (isNumber(dateWithYear.getTime())) {
            date = dateWithYear;
        } else {
            return {error: 'Aikamäärettä ei voitu tulkita'};
        }

        let time = defaultDate;
        if (parts[1] === 'klo') {
            if (!parts[2]) {
                return {error: 'Kellonaika puuttuu'};
            }

            time = parse(parts[2], TIME_24H_FORMAT, defaultDate);
            consumed.push(parts[1], parts[2]);
        } else if (parts[1]) {
            time = parse(parts[1], TIME_24H_FORMAT, defaultDate);
            consumed.push(parts[1]);
        }

        if (!isNumber(time.getTime())) {
            return {error: 'Kellonaikaa ei voitu tulkita'};
        }

        date.setHours(time.getHours());
        date.setMinutes(time.getMinutes());

        return {value: date, consumed};
    }

    return {error: 'Aikamäärettä ei voitu tulkita'};
}

function parseDuration(parts: string[]) {
    if (!parts.length) {
        return {error: 'Aikamääre puuttuu'};
    }

    const defaultError = {error: 'Viivettä ei voitu tulkita'};
    const consumed: string[] = [];

    // duration
    const d: Duration = {};
    let buffer: number | undefined = undefined;
    let setCount = 0;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (isNumber(part)) {
            if (buffer !== undefined && i !== 0) {
                return defaultError;
            }

            // e.g. "10"
            buffer = Number(part);
        } else {
            const dKey = getDurationKeyFromMap(part);

            if (!dKey) {
                if (setCount > 0) {
                    // probably there's something else after duration
                    return {value: d, consumed};
                }

                return defaultError;
            }

            if (d[dKey] !== undefined) {
                return {error: 'Viipeen aikamääre oli jo asetettu'};
            }

            if (buffer === undefined) {
                return defaultError;
            }

            // e.g. "10 vuotta"
            d[dKey] = buffer;
            buffer = undefined;
            setCount++;
        }

        consumed.push(part);
    }

    return {value: d, consumed};
}

const fiDurationMap: Readonly<Record<keyof Duration, string[]>> = {
    years: ['vuosi', 'vuotta', 'v'],
    months: ['kuukausi', 'kuukautta', 'kk'],
    weeks: ['viikko', 'viikkoa', 'vko'],
    days: ['päivä', 'päivää', 'pvä', 'vrk', 'p'],
    hours: ['tunti', 'tuntia', 't'],
    minutes: ['minuutti', 'minuuttia', 'min'],
    seconds: ['sekunti', 'sekuntia', 'sek', 's'],
};

function getDurationKeyFromMap(str: string): keyof typeof fiDurationMap | undefined {
    return objectKeys(fiDurationMap).find((k) => {
        return fiDurationMap[k].find((map) => str === map);
    });
}

export {CommandParam, getDurationKeyFromMap, parseDateTime, parseDuration};
