import {EventListener} from 'listener';
import {Veikka} from 'veikka';

interface Publisher extends EventListener {
    subscriptions: string[];
    timer?: Timer;
    addSubscription(channel: string): this;
    startTimer(client: Veikka): void;
    stopTimer(): void;
}

export {Publisher};
