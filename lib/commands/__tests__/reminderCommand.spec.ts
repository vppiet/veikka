import {describe, test, expect} from 'bun:test';
import {ReminderCommand} from '../reminderCommand';

describe('reminderCommand', () => {
    test('matches when no parameters', () => {
        const cmd = new ReminderCommand();
        expect(cmd.match('.muistuta xx, xx')).toBe(true);
    });
});

// https://date-fns.org/v2.30.0/docs/parse
