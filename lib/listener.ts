import {IrcEvent} from 'irc-framework';

type IrcEventListener = {
    getEventName(): string;
    listener(event: IrcEvent): void;
};

export {IrcEventListener};
