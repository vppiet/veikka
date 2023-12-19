import {addDays, isValid, parse} from "date-fns";

import {ARG_SEP} from "../command";
import {ParserFn} from "../commandParam";
import {isNumber, objectKeys} from "../util";

const FI_DURATION_MAP: Readonly<Record<keyof Duration, string[]>> = {
    years: ['vuosi', 'vuotta', 'v'],
    months: ['kuukausi', 'kuukautta', 'kk'],
    weeks: ['viikko', 'viikkoa', 'vko'],
    days: ['päivä', 'päivää', 'pvä', 'vrk', 'p'],
    hours: ['tunti', 'tuntia', 't'],
    minutes: ['minuutti', 'minuuttia', 'min'],
    seconds: ['sekunti', 'sekuntia', 'sek', 's'],
};

const parseDuration: ParserFn<Duration> = (parts: string[]) => {
    const consumed: string[] = [];
    const value: Duration = {};
    let count = 0;
    let end = 2;

    for (let start = 0; start <= parts.length; start += 2) {
        const [amount, unit] = parts.slice(start, end);

        if (!isNumber(amount)) {
            if (count > 0) {
                return {value, consumed};
            }

            return {error: 'Expected duration amount to be numerical'};
        }

        const key = getDurationKeyFromMap(unit);
        if (key === undefined) {
            if (count > 0) {
                return {value, consumed};
            }

            return {error: 'Expected duration unit to be mapped'};
        }

        value[key] = (value[key] ?? 0) + Number(amount);

        consumed.push(amount, unit);

        end += 2;
        count++;
    }

    return {value, consumed};
};

const DATETIME_FORMATS: readonly {regex: RegExp, strings: string[]}[] = [
    {
        regex: /^\d{1,2}\.\d{1,2}\.$/,
        strings: ['d.M. \'klo\' H:mm', 'd.M. \'klo\' H', 'd.M. H:mm', 'd.M.',],
    },
    {
        regex: /^\d{1,2}\.\d{1,2}\.\d{1,4}$/,
        strings: ['d.M.yyyy \'klo\' H', 'd.M.yyyy \'klo\' H:mm', 'd.M.yyyy H:mm', 'd.M.yyyy'],
    },
];

const parseDateTime: ParserFn<Date, [Date]> = (parts: string[], referenceDate: Date) => {
    const firstPart = parts[0];

    for (const FORMAT of DATETIME_FORMATS) {
        // datetime formats
        if (FORMAT.regex.test(firstPart)) {
            for (const strFormat of FORMAT.strings) {
                const partCount = strFormat.split(ARG_SEP).length;
                const dateParts = parts.slice(0, partCount);
                const dateString = dateParts.join(ARG_SEP);
                const result = parse(dateString, strFormat, referenceDate);

                if (isValid(result.getTime())) {
                    return {value: result, consumed: dateParts};
                }
            }

            return {error: 'Invalid date argument'};
        }
    }

    return {error: 'Date formats exhausted'};
};

function getDurationKeyFromMap(str: string): keyof typeof FI_DURATION_MAP | undefined {
    return objectKeys(FI_DURATION_MAP).find((k) => {
        return FI_DURATION_MAP[k].find((map) => str === map);
    });
}

const DAY_DELTAS: Readonly<Record<string, number>> = {
    'eilen': -1,
    'tänään': 0,
    'huomenna': 1,
    'ylihuomenna': 2,
};

const parseDayDelta: ParserFn<Date, [Date]> = (parts: string[], referenceDate: Date) => {
    const deltaName = parts[0];

    if (deltaName in DAY_DELTAS) {
        const deltaValue = DAY_DELTAS[deltaName];
        const date = addDays(referenceDate, deltaValue);

        return {value: date, consumed: [parts[0]]};
    }

    return {error: 'Could not parse day delta'};
}

const TIME_24H_FORMATS = ['H:mm', '\'klo\' H:mm'];

const parseTime: ParserFn<Date, [Date]> = (parts: string[], referenceDate: Date) => {
    for (const FORMAT of TIME_24H_FORMATS) {
        const timeParts = parts.slice(0, FORMAT.split(ARG_SEP).length);
        const timeString = timeParts.join(ARG_SEP);
        const date = parse(timeString, FORMAT, referenceDate);

        if (isValid(date)) {
            return {value: date, consumed: timeParts};
        }
    }

    return {error: 'Could not parse time'};
};

const parseDayDeltaWithTime: ParserFn<Date, [Date]> = (parts: string[], referenceDate: Date) => {
    const consumed = [];

    const dayDeltaResult = parseDayDelta(parts, referenceDate);

    if ('error' in dayDeltaResult) {
        return {error: dayDeltaResult.error};
    }

    consumed.push(...dayDeltaResult.consumed);
    const date = dayDeltaResult.value;

    const timeParts = parts.slice(dayDeltaResult.consumed.length);
    if (timeParts.length) {
        const timeResult = parseTime(timeParts, date);

        if ('value' in timeResult && isValid(timeResult.value)) {
            // ignore parse error
            consumed.push(...timeResult.consumed);

            const time = timeResult.value;
            date.setHours(time.getHours());
            date.setMinutes(time.getMinutes());

            return {value: date, consumed};
        }
    }

    return {value: date, consumed};
}

const parseDateTimeOrDayDelta: ParserFn<Date, [Date]> = (parts: string[], referenceDate: Date) => {
    const dayDeltaResult = parseDayDeltaWithTime(parts, referenceDate);
    if ('value' in dayDeltaResult) {
        return dayDeltaResult;
    }

    const dateTimeResult = parseDateTime(parts, referenceDate);
    if ('value' in dateTimeResult) {
        return dateTimeResult;
    }

    return {error: 'Could not parse day delta or date time'};
}

export {
    parseDateTime,
    parseDateTimeOrDayDelta,
    parseDayDelta,
    parseDayDeltaWithTime,
    parseDuration,
    parseTime
};
