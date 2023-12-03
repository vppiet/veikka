import {describe, test, expect} from 'bun:test';

import {CoordinatePoint, CoordinateType, Coordinates} from '../weatherApi';

// Expected values from https://www.pgc.umn.edu/apps/convert/ (DD -> DMS)

describe('weatherApi', () => {
    test('CoordinatePoint: positive', () => {
        expect(CoordinatePoint.parse(0, CoordinateType.Lat).positive).toBeTrue();
        expect(CoordinatePoint.parse(12.34, CoordinateType.Lat).positive).toBeTrue();
        expect(CoordinatePoint.parse(-12.34, CoordinateType.Lat).positive).toBeFalse();
    });

    test('CoordinatePoint: degrees', () => {
        expect(CoordinatePoint.parse(0, CoordinateType.Lat).degrees).toBe(0);
        expect(CoordinatePoint.parse(12.34, CoordinateType.Lat).degrees).toBe(12);
        expect(CoordinatePoint.parse(60.16952, CoordinateType.Lat).degrees).toBe(60);
    });

    test('CoordinatePoint: minutes', () => {
        expect(CoordinatePoint.parse(0, CoordinateType.Lat).minutes).toBe(0);
        expect(CoordinatePoint.parse(12.34, CoordinateType.Lat).minutes).toBe(20);
        expect(CoordinatePoint.parse(60.16952, CoordinateType.Lat).minutes).toBe(10);
    });

    test('CoordinatePoint: seconds', () => {
        expect(CoordinatePoint.parse(0, CoordinateType.Lat).seconds).toBe(0);
        expect(CoordinatePoint.parse(12.34, CoordinateType.Lat).seconds).toBe(24);
        expect(CoordinatePoint.parse(60.16952, CoordinateType.Lat).seconds).toBe(10.272);
    });

    test('CoordinatePoint: getISO', () => {
        expect(CoordinatePoint.parse(0, CoordinateType.Lat).getISO()).toBe('0°00′00″N');
        expect(CoordinatePoint.parse(12.34, CoordinateType.Lat).getISO()).toBe(`12°20′24″N`);
        expect(CoordinatePoint.parse(60.16952, CoordinateType.Lat).getISO())
            .toBe(`60°10′10.272″N`);
        expect(CoordinatePoint.parse(0.1, CoordinateType.Lat).getISO()).toBe(`0°06′00″N`);
        expect(CoordinatePoint.parse(-0.1, CoordinateType.Lon).getISO()).toBe('0°06′00″W');
    });

    test('Coordinates: miscellaneous', () => {
        expect(new Coordinates(12.01, 56.02).getISO()).toBe('12°00′36″N 56°01′12″E');
        expect(new Coordinates(-26, -32.140).getISO()).toBe('26°00′00″S 32°08′24″W');
        expect(new Coordinates(46.38, 21.55).getISO()).toBe('46°22′48″N 21°33′00″E');
    });
});
