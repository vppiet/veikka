import {afterAll, beforeAll, describe, expect, setSystemTime, test} from 'bun:test';

import {ParamParseSuccess} from '../../commandParam';
import {assertObject} from '../../util';
import {
    parseDateTime,
    parseDayDelta,
    parseDayDeltaWithTime,
    parseDuration,
    parseTime,
} from '../dateParam';

const timeZoneBefore = process.env.TZ;
let referenceDate: Date;

beforeAll(() => {
    process.env.TZ = 'Europe/Helsinki';
    setSystemTime(new Date('2023-12-17T01:02:03.420Z'));
    referenceDate = new Date();
});

afterAll(() => {
    process.env.TZ = timeZoneBefore;
    setSystemTime();
});

describe('dateParam', () => {
    test('datetime, "d.M. klo H:mm"', () => {
        const result = parseDateTime(['15.12.', 'klo', '12:33'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2023-12-15T10:33:00.000Z');
        expect(result.consumed).toEqual(['15.12.', 'klo', '12:33']);
    });

    test('datetime, "d.M. klo H"', () => {
        const result = parseDateTime(['15.12.', 'klo', '12'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2023-12-15T10:00:00.000Z');
        expect(result.consumed).toEqual(['15.12.', 'klo', '12']);
    });

    test('datetime, "d.M. klo H with trailing string"', () => {
        const result = parseDateTime(['15.12.', 'klo', '12', 'trailing'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2023-12-15T10:00:00.000Z');
        expect(result.consumed).toEqual(['15.12.', 'klo', '12']);
    });

    test('datetime, "d.M. H:mm"', () => {
        const result = parseDateTime(['15.12.', '4:20'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2023-12-15T02:20:00.000Z');
        expect(result.consumed).toEqual(['15.12.', '4:20']);
    });

    test('datetime, "d.M."', () => {
        const result = parseDateTime(['1.1.'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2022-12-31T22:00:00.000Z');
        expect(result.consumed).toEqual(['1.1.']);
    });

    test('datetime, "d.M.yyyy klo H:mm"', () => {
        const result = parseDateTime(['31.12.2023', 'klo', '12:04'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2023-12-31T10:04:00.000Z');
        expect(result.consumed).toEqual(['31.12.2023', 'klo', '12:04']);
    });

    test('datetime, "d.M.yyyy H:mm"', () => {
        const result = parseDateTime(['31.12.2023', '12:04'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2023-12-31T10:04:00.000Z');
        expect(result.consumed).toEqual(['31.12.2023', '12:04']);
    });

    test('datetime, "d.M.yyyy klo H"', () => {
        const result = parseDateTime(['31.12.2023'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2023-12-30T22:00:00.000Z');
        expect(result.consumed).toEqual(['31.12.2023']);
    });

    test('datetime, "d.M.yyyy"', () => {
        const result = parseDateTime(['31.12.2023'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2023-12-30T22:00:00.000Z');
        expect(result.consumed).toEqual(['31.12.2023']);
    });

    test('duration, single amount & unit pair', () => {
        const result = parseDuration(['4', 'vuotta']);
        assertObject<ParamParseSuccess<Duration>>(result, 'value');

        expect(result.value).toEqual({years: 4});
        expect(result.consumed).toEqual(['4', 'vuotta']);
    });

    test('duration, two amount & unit pairs', () => {
        const result = parseDuration(['8', 'minuuttia', '30', 's']);
        assertObject<ParamParseSuccess<Duration>>(result, 'value');

        expect(result.value).toEqual({minutes: 8, seconds: 30});
        expect(result.consumed).toEqual(['8', 'minuuttia', '30', 's']);
    });

    test('duration, one amount & unit pair and trailing string', () => {
        const result = parseDuration(['8', 'minuuttia', '30', 's', 'some message']);
        assertObject<ParamParseSuccess<Duration>>(result, 'value');

        expect(result.value).toEqual({minutes: 8, seconds: 30});
        expect(result.consumed).toEqual(['8', 'minuuttia', '30', 's']);
    });

    test('time, "H:m"', () => {
        const result = parseTime(['10:20'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.getHours()).toEqual(10);
        expect(result.value.getMinutes()).toEqual(20);
        expect(result.consumed).toEqual(['10:20']);
    });

    test('time, "klo H:m"', () => {
        const result = parseTime(['klo', '10:20'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.getHours()).toEqual(10);
        expect(result.value.getMinutes()).toEqual(20);
        expect(result.consumed).toEqual(['klo', '10:20']);
    });

    test('day delta', () => {
        const result = parseDayDelta(['huomenna'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2023-12-17T22:00:00.000Z');
        expect(result.consumed).toEqual(['huomenna']);
    });

    test('day delta', () => {
        const result = parseDayDelta(['eilen'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2023-12-15T22:00:00.000Z');
        expect(result.consumed).toEqual(['eilen']);
    });

    test('day delta with time', () => {
        const result = parseDayDeltaWithTime(['huomenna', 'klo', '10:20'], referenceDate);
        assertObject<ParamParseSuccess<Date>>(result, 'value');

        expect(result.value.toISOString()).toBe('2023-12-18T08:20:00.000Z');
        expect(result.consumed).toEqual(['huomenna', 'klo', '10:20']);
    });

    test('day delta with invalid time', () => {
        const result = parseDayDeltaWithTime(['huomenna', 'klo', '33:20'], referenceDate);
        expect(result).toHaveProperty('error');
    });
});
