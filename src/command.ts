import { Logger } from 'winston';
import { PrivMsgEvent } from './types/irc-framework';

import { CommandParam } from './commandParam';
import { EventListener } from './listener';
import { getLogger } from './logger';
import { Context, PropertyValue, capitalize, isAdmin } from './util';
import { Veikka } from './veikka';

const PRIVILEGE_LEVEL = {
    USER: 100,
    ELEVATED_USER: 110,
    ADMIN: 200,
} as const;

const ARG_SEP = ' ';

abstract class Command<P> implements EventListener {
    eventName = 'privmsg';
    prefix: string;
    name: string;
    help: string[];
    params: CommandParam<P>[];
    privilegeLevel: PropertyValue<typeof PRIVILEGE_LEVEL>;
    logger: Logger;

    constructor(prefix: string, name: string, help: string[], params: CommandParam<P>[] = [],
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

    abstract eventHandler(event: PrivMsgEvent, args: P[], client: Veikka): void;

    createSay(...input: string[]) {
        const capitalizedName = capitalize(this.name);
        input.unshift(capitalizedName);
        return input.join(' | ');
    }

    parseArguments(msgParts: string[]): {args: P[]} | {error: string} {
        const args: P[] = [];

        if (this.params.length === 0) {
            return {args};
        }

        let parts = msgParts;

        for (const param of this.params) {
            const result = param.parse(parts);

            if ('error' in result) {
                if (param.required) {
                    return {error: result.error};
                } else {
                    return {args};
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

export { ARG_SEP, Command, PRIVILEGE_LEVEL };

