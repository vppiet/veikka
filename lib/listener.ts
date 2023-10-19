import {IrcEvent} from 'irc-framework';

type IrcEventListener = {
    getEventName(): string;
    listener(event: IrcEvent): void;
};

type Prioritized = {
    isReady(): boolean;
};

export {IrcEventListener, Prioritized};
