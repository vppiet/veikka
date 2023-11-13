import {describe, test, expect} from 'bun:test';
import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL} from '../command';

class TestCommand extends Command {
    constructor() {
        super('.', 'test', ['Test case'], 1);
    }

    getEventName(): string {
        return 'privmsg';
    }
    listener(event: PrivMsgEvent): void {
        throw new Error('Method not implemented.');
    }
}

describe('command', () => {
    test('does\'t match when no parameters are given but one is required', () => {
        const cmd = new TestCommand();
        expect(cmd.match('.test')).toBe(false);
    });
});
