import { NoticeEvent } from './types/irc-framework';
import { Context } from './util';
import { Veikka } from './veikka';

interface NetworkHandler {
    handler: (client: Veikka) => void;
}

class QuakenetHandler implements NetworkHandler {
    attachedListener: ((event: NoticeEvent) => void) | undefined;

    handler(client: Veikka) {
        const user = Bun.env.QUAKENET_USER;
        const pwd = Bun.env.QUAKENET_PWD;

        if (!user || !pwd) {
            client.emit('network services');
            return;
        }

        const noticeListenerBound = this.noticeListener.bind({client, listener: this});
        client.addListener('notice', noticeListenerBound);
        this.attachedListener = noticeListenerBound;

        client.say('Q@CServe.quakenet.org', `AUTH ${user} ${pwd}`);
    }

    noticeListener(this: Context<QuakenetHandler>, event: NoticeEvent) {
        const {client, listener} = this;

        if (event.ident === 'TheQBot' && event.hostname === 'CServe.quakenet.org') {
            if (event.message.startsWith('You are now logged in as ')) {
                const displayedHostListenerBound = listener.displayedHostListener.bind(this);
                client.once('displayed host', displayedHostListenerBound);
                client.mode(client.user.nick, '+x');

                client.removeListener('notice', listener.attachedListener);
                listener.attachedListener = displayedHostListenerBound;
            } else {
                client.emit('network services');
                client.removeListener('notice', listener.attachedListener);
            }
        }
    }

    displayedHostListener(this: Context<QuakenetHandler>) {
        const {client, listener} = this;

        client.removeListener('displayed host', listener.attachedListener);
        client.emit('network services');
    }
}

const networks: Readonly<Record<string, NetworkHandler>> = {
    'quakenet.org': new QuakenetHandler(),
};

export { NetworkHandler, QuakenetHandler };
export default networks;
