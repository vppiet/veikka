import {IrcEventListener} from 'listener';
import {Veikka} from 'veikka';

interface Publisher extends IrcEventListener {
    subscriptions: string[];
    timer?: Timer;
    addSubscription(channel: string): this;
    startTimer(client: Veikka): void;
    stopTimer(): void;
}

export {Publisher};
