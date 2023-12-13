import { beforeAll, describe, expect, jest, test } from 'bun:test';
import { PrivMsgEvent } from '../types/irc-framework';

import { Command } from '../command';

class TestCommand extends Command {
    constructor() {
        super('.', 'test', ['Test case']);
    }

    eventHandler(): void {
        throw new Error('Method not implemented.');
    }
}

const getMockEvent = (message: string, hostname?: string, ident?: string): PrivMsgEvent => {
    return {
        from_server: false,
        nick: '',
        ident: ident || '',
        hostname: hostname || '',
        target: '',
        message,
        tags: {},
        time: 0,
        account: '',
        batch: '',
        reply: jest.fn(),
    };
};

describe('Command', () => {
    let cmd: Command;

    beforeAll(async () => {
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
