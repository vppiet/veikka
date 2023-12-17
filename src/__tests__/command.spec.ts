import {beforeAll, describe, expect, test} from 'bun:test';

import {Command} from '../command';
import {CommandParam} from '../commandParam';

const testParam: CommandParam<string> = {
    required: true,
    parse: (parts: string[]) => {
        return {value: parts[0], consumed: parts};
    },
};

class TestCommand extends Command<string> {
    constructor() {
        super('.', 'test', ['Test case'], [testParam]);
    }

    eventHandler(): void {
        throw new Error('Method not implemented.');
    }
}

describe('Command', () => {
    let cmd: Command<string>;

    beforeAll(() => {
        cmd = new TestCommand();
    });

    test('matches to its prefixed name', () => {
        expect(cmd.match('.test')).toBe(true);
    });

    test('matching requires a space after prefixed name', () => {
        expect(cmd.match('.testing')).toBe(false);
        expect(cmd.match('.test_arg1 arg2')).toBe(false);
        expect(cmd.match('.testarg1 arg2')).toBe(false);
        expect(cmd.match('.test arg1 arg2')).toBe(true);
    });
});
