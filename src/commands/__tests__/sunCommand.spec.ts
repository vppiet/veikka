import {describe, test, expect, beforeAll} from 'bun:test';
import {SunCommand} from 'commands/sunCommand';

describe('SunCommand', () => {
    let cmd: SunCommand;

    beforeAll(() => {
        cmd = new SunCommand();
    });

    test('location argument is parsed', () => {
        const msg = `${cmd.getPrefixedName()} San Jose`;
        expect(cmd.parseArguments(msg, new Date()).location).toBe('San Jose');
    });

    test('date argument (date format) is parsed', () => {
        const msg = `${cmd.getPrefixedName()} San Jose 6.12.2023`;
        const date = cmd.parseArguments(msg, new Date()).date;
        expect(date?.getDate()).toBe(6);
        expect(date?.getMonth()).toBe(11);
        expect(date?.getFullYear()).toBe(2023);
    });

    test('date argument (delta format) is parsed', () => {
        const msg = `${cmd.getPrefixedName()} San Jose huomenna`;
        const date = cmd.parseArguments(msg, new Date()).date;
        expect(date?.getDate()).toBe(7);
        expect(date?.getMonth()).toBe(11);
        expect(date?.getFullYear()).toBe(2023);
    });

    test('error when no location', () => {
        const msg = cmd.getPrefixedName();
        const result = cmd.parseArguments(msg, new Date());
        expect(result).toHaveProperty('error');
        expect(result.error).not.toBeUndefined();
    });

    test('error when invalid date format', () => {
        const msg = cmd.getPrefixedName() + ' Juankoski 2023-12-06';
        const result = cmd.parseArguments(msg, new Date());
        expect(result).toHaveProperty('error');
        expect(result.error).not.toBeUndefined();
    });
});
