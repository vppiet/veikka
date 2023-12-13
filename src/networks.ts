import {NoticeEvent} from 'irc-framework';
import {Context} from './util';
import {Veikka} from './veikka';

interface NetworkHandler {
    onRegistered(client: Veikka): void;
}

interface QuakenetHandler {
    displayedHostListener(): void;
    noticeListener(event: NoticeEvent): void;
}

const quakenetHandler = {
    onRegistered(client: Veikka) {
        const user = Bun.env.QUAKENET_USER;
        const pwd = Bun.env.QUAKENET_PWD;

        if (!user || !pwd) {
            client.emit('network services');
            return;
        }

        client.addListener('notice', this.noticeListener, {client, listener: this});
        client.say('Q@CServe.quakenet.org', `AUTH ${user} ${pwd}`);
    },
    noticeListener(this: Context<QuakenetHandler>, event: NoticeEvent) {
        const {client, listener} = this;

        if (event.ident === 'TheQBot' && event.hostname === 'CServe.quakenet.org') {
            if (event.message.startsWith('You are now logged in as ')) {
                client.once('displayed host', listener.displayedHostListener);
                client.mode(client.user.nick, '+x');
            } else {
                client.emit('network services');
            }

            client.removeListener('notice', listener.noticeListener);
        }
    },
    displayedHostListener(this: Context<QuakenetHandler>) {
        const {client, listener} = this;

        client.removeListener('displayed host', listener.displayedHostListener);
        client.emit('network services');
    }
}

const networks: Readonly<Record<string, NetworkHandler>> = {
    'quakenet.org': quakenetHandler,
};

export default networks;
