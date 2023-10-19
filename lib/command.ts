import {IrcEvent} from 'irc-framework';
import {IrcEventListener} from 'listener';

const PRIVILEGE_LEVEL = {
    USER: 0,
    ELEVATED_USER: 1,
    ADMIN: 2,
} as const;

abstract class Command implements IrcEventListener {
    readonly prefix: string;
    readonly name: string;
    readonly privilegeLevel: number;

    constructor(prefix: string, name: string, privilegeLevel: number = PRIVILEGE_LEVEL.USER) {
        this.prefix = prefix;
        this.name = name;
        this.privilegeLevel = privilegeLevel;
    }

    abstract getEventName(): string;
    abstract listener(event: IrcEvent): void;

    getPrefixedName() {
        return this.prefix + this.name;
    }

    match(str: string) {
        return str.trim().toLowerCase().startsWith(this.getPrefixedName().toLowerCase());
    }
}

export {PRIVILEGE_LEVEL, Command};
