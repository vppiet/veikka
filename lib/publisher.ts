import {IrcEventListener} from 'listener';
import {Veikka} from 'veikka';

type Publisher = {
    subscriptions: string[];
    timer?: Timer;
    addSubscription(channel: string): Publisher;
    startTimer(client: Veikka): void;
    stopTimer(): void;
} & IrcEventListener;

export {Publisher};
