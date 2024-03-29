import {PrivMsgEvent} from 'irc-framework';
import {Logger} from 'winston';

import {CommandParam} from './commandParam';
import {EventListener} from './listener';
import {getLogger} from './logger';
import {Context, PropertyValue, isAdmin} from './util';
import {Veikka} from './veikka';

const PRIVILEGE_LEVEL = {
    USER: 100,
    ELEVATED_USER: 110,
    ADMIN: 200,
} as const;

const ARG_SEP = ' ';

type MappedCommandParam<T> = {[K in keyof T]: CommandParam<Exclude<T[K], undefined>>};
type Union<T extends unknown[]> = T[number];

abstract class Command<P extends unknown[] = never[]> implements EventListener {
    eventName = 'privmsg';
    prefix: string;
    name: string;
    help: string[];
    params: MappedCommandParam<P>;
    privilegeLevel: PropertyValue<typeof PRIVILEGE_LEVEL>;
    logger: Logger;

    constructor(prefix: string, name: string, help: string[],
        params: MappedCommandParam<P>,
        privilegeLevel: PropertyValue<typeof PRIVILEGE_LEVEL> = PRIVILEGE_LEVEL.USER) {
        this.prefix = prefix;
        this.name = name;
        this.help = help;
        this.params = params;
        this.privilegeLevel = privilegeLevel;
        this.logger = getLogger('Command-' + this.name);
    }

    getHelp(...input: string[]) {
        return this.createSay(...this.help, ...input);
    }

    getPrefixedName() {
        return this.prefix + this.name;
    }

    getArgsParts(message: string) {
        return this.getMsgTail(message)
            .split(ARG_SEP)
            .map((p) => p.trim())
            .filter((p) => p.length);
    }

    getMsgTail(message: string) {
        return message.slice(this.getPrefixedName().length + 1).trim();
    }

    listener(this: Context<Command<P>>, event: PrivMsgEvent) {
        const {client, listener: cmd} = this;

        if (!cmd.match(event.message, event.ident, event.hostname)) {
            return;
        }

        const argParts = cmd.getArgsParts(event.message);
        const argsParseResult = cmd.parseArguments(argParts);

        cmd.logger.info({command: cmd.getPrefixedName(), argsParseResult});

        if ('error' in argsParseResult) {
            cmd.reply(event, argsParseResult.error);
        } else if ('args' in argsParseResult) {
            /* TYPING ISSUE: do we have a fundamental design issue here?
            The shuffling between arrays and tuples */
            cmd.eventHandler(event, argsParseResult.args, client);
        }
    }

    match(str: string, ident?: string, hostname?: string) {
        str = str.trimStart().toLowerCase();
        const cmd = this.getPrefixedName().toLowerCase();

        if (!str.startsWith(cmd)) return false;

        // next possible character is a space
        if (str.length > cmd.length && !(str[cmd.length] === ' ')) return false;

        if (this.privilegeLevel === PRIVILEGE_LEVEL.ADMIN) {
            if (ident === undefined || hostname === undefined) return false;
            if (!isAdmin(ident, hostname)) return false;
        }

        return true;
    }

    abstract eventHandler(event: PrivMsgEvent, args: P, client: Veikka): void;

    createSay(...input: string[]) {
        return input.join(' | ');
    }

    parseArguments(parts: string[]): {args: Union<P>[]} | {error: string} {
        const args: Union<P>[] = [];

        if (!this.params.length) {
            return {args};
        }

        for (const param of this.params) {
            if (param.required && !parts.length) {
                return {error: `Tarvittava argumentti (${param.name}) puuttuu`};
            }

            const result = param.parse(parts);

            if ('error' in result) {
                if (param.required) {
                    // short-circuit when a required argument cannot be parsed
                    return {error: `Tarvittavaa argumenttia (${param.name}) ei voitu tulkita` +
                        (result.error ? ` (${result.error})` : '')};
                } else {
                    /* continue on optional arguments (we might have optional arguments left)
                        insert undefined as placeholder */
                    args.push(undefined);
                    continue;
                }
            }

            parts = parts.slice(result.consumed.length);
            args.push(result.value);
        }

        return {args};
    }

    reply(event: PrivMsgEvent, ...segments: string[]) {
        event.reply(this.createSay(...segments));
    }
}

export {ARG_SEP, Command, PRIVILEGE_LEVEL};
