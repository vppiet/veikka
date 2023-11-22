import {IrcEvent} from 'irc-framework';
import {IrcEventListener} from 'listener';
import {capitalize, isAdmin} from './util';

const PRIVILEGE_LEVEL = {
    USER: 100,
    ELEVATED_USER: 110,
    ADMIN: 200,
} as const;

const PARAM_SEP = ', ';

abstract class Command implements IrcEventListener {
    readonly prefix: string;
    readonly name: string;
    readonly help: string[];
    readonly reqParams: number;
    readonly optParams: number;
    readonly privilegeLevel: typeof PRIVILEGE_LEVEL[keyof typeof PRIVILEGE_LEVEL];

    constructor(prefix: string, name: string, help: string[], reqParams = 0, optParams = 0,
        privilegeLevel: typeof PRIVILEGE_LEVEL[keyof typeof PRIVILEGE_LEVEL] =
        PRIVILEGE_LEVEL.USER) {
        this.prefix = prefix;
        this.name = name;
        this.help = help;
        this.reqParams = reqParams;
        this.optParams = optParams;
        this.privilegeLevel = privilegeLevel;
    }

    abstract getEventName(): string;
    abstract listener(event: IrcEvent): void;

    getPrefixedName() {
        return this.prefix + this.name;
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

        const params = str.slice(cmd.length)
            .split(PARAM_SEP)
            .map((p) => p.trim())
            .filter((p) => p.length !== 0);

        return params.length >= this.reqParams;
    }

    parseParameters(message: string) {
        const paramCount = this.reqParams + this.optParams;

        // https://stackoverflow.com/a/5582719
        const parts = message.trimStart()
            .slice(this.getPrefixedName().length + 1)
            .split(PARAM_SEP);
        const tail = parts.slice(paramCount - 1).join(PARAM_SEP);
        let params = parts.slice(0, paramCount - 1);
        if (tail) params.push(tail);

        params = params.map((p) => p.trim());

        return {
            req: params.slice(0, this.reqParams),
            opt: params.slice(this.reqParams),
        };
    }

    static joinWithSeparator(...input: string[]) {
        return input.join(' | ');
    }

    createSay(...input: string[]) {
        const capitalizedName = capitalize(this.name);
        input.unshift(capitalizedName);
        return input.join(' | ');
    }

    getHelp(...input: string[]) {
        return this.createSay(...this.help, ...input);
    }
}

export {PRIVILEGE_LEVEL, PARAM_SEP, Command};
