import {IrcEvent} from 'irc-framework';
import {IrcEventListener} from 'listener';
import {isAdmin} from './util';

const PRIVILEGE_LEVEL = {
    USER: 0,
    ELEVATED_USER: 1,
    ADMIN: 2,
} as const;

abstract class Command implements IrcEventListener {
    readonly prefix: string;
    readonly name: string;
    readonly privilegeLevel: number;
    readonly parameters: number;

    constructor(prefix: string, name: string, privilegeLevel: number = PRIVILEGE_LEVEL.USER,
        parameters = 0) {
        this.prefix = prefix;
        this.name = name;
        this.privilegeLevel = privilegeLevel;
        this.parameters = parameters;
    }

    abstract getEventName(): string;
    abstract listener(event: IrcEvent): void;

    getPrefixedName() {
        return this.prefix + this.name;
    }

    match(str: string, ident?: string, hostname?: string) {
        str = str.trim().toLowerCase();
        const cmd = this.getPrefixedName().toLowerCase();

        if (!str.startsWith(cmd)) return;
        if (this.privilegeLevel === PRIVILEGE_LEVEL.ADMIN) {
            if (ident === undefined || hostname === undefined) return;
            if (!isAdmin(ident, hostname)) return;
        }

        const params = str.split(' ');

        return params.length - 1 === this.parameters;
    }
}

export {PRIVILEGE_LEVEL, Command};
