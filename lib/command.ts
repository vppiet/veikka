import {IrcEvent} from 'irc-framework';
import {IrcEventListener} from 'listener';
import {isAdmin} from './util';

const PRIVILEGE_LEVEL = {
    USER: 0,
    ELEVATED_USER: 1,
    ADMIN: 2,
} as const;

const PARAM_SEP = ', ';

abstract class Command implements IrcEventListener {
    readonly prefix: string;
    readonly name: string;
    readonly privilegeLevel: number;
    readonly paramCount: number;

    constructor(prefix: string, name: string, privilegeLevel: number = PRIVILEGE_LEVEL.USER,
        paramCount = 0) {
        this.prefix = prefix;
        this.name = name;
        this.privilegeLevel = privilegeLevel;
        this.paramCount = paramCount;
    }

    abstract getEventName(): string;
    abstract listener(event: IrcEvent): void;

    getPrefixedName() {
        return this.prefix + this.name;
    }

    match(str: string, ident?: string, hostname?: string) {
        str = str.trimStart().toLowerCase();
        const cmd = this.getPrefixedName().toLowerCase();

        if (!str.startsWith(cmd)) return;

        // next possible character is a space
        if (str.length > cmd.length && !(str[cmd.length] === ' ')) return;

        if (this.privilegeLevel === PRIVILEGE_LEVEL.ADMIN) {
            if (ident === undefined || hostname === undefined) return;
            if (!isAdmin(ident, hostname)) return;
        }

        const params = str.slice(this.getPrefixedName().length)
            .split(PARAM_SEP);

        return params.length >= this.paramCount;
    }

    parseParameters(message: string) {
        if (this.paramCount === 0) return [];

        // https://stackoverflow.com/a/5582719
        const parts = message.trimStart()
            .slice(this.getPrefixedName().length)
            .split(PARAM_SEP);
        const tail = parts.slice(this.paramCount).join(PARAM_SEP);
        const result = parts.slice(0, this.paramCount);
        if (tail) result.push(tail);

        return result.map((e) => e.trim());
    }
}

export {PRIVILEGE_LEVEL, PARAM_SEP, Command};
