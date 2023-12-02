import {describe, test, expect} from 'bun:test';
import {getJulianDateFromDate, getMoonIllumination} from '../moon';

describe('moon', () => {
    test('getJulianDateFromUnixTime(): correct calculation', () => {
        const date = new Date(2013, 7, 4, 1, 15, 23, 500);
        expect(getJulianDateFromDate(date)).toBeCloseTo(2456508.427355);
    });

    test('getMoonIllumination(): correct estimate', () => {
        const date1 = new Date(2023, 11, 2, 22, 12, 50);
        expect(getMoonIllumination(date1)).toBeCloseTo(0.7212);

        const date2 = new Date(2024, 6, 6, 1, 57, 0, 0);
        expect(getMoonIllumination(date2)).toBeCloseTo(0);

        const date3 = new Date(1989, 1, 15, 12, 0, 0, 0);
        expect(getMoonIllumination(date3)).toBeCloseTo(0.75);

        const date4 = new Date();
        expect(getMoonIllumination(date4)).toBeCloseTo(0.72);
    });
});
