import {Veikka} from 'veikka';
import {Context} from './util';
import {DisplayedHostEvent, NoticeEvent} from 'irc-framework';

type NetworkHandler = {
    handler: (client: Veikka) => void;
};

class QuakenetHandler implements NetworkHandler {
    handler(client: Veikka) {
        const user = Bun.env['QUAKENET_USER'];
        const pwd = Bun.env['QUAKENET_PWD'];

        if (!user || !pwd) {
            client.emit('network services');
            return;
        }

        client.addListener('notice', this.noticeListener, {client: client, listener: this});
        client.say('Q@CServe.quakenet.org', `AUTH ${user} ${pwd}`);
    }

    noticeListener(this: Context<QuakenetHandler>, event: NoticeEvent) {
        const {client, listener} = this;

        if (event.ident === 'TheQBot' && event.hostname === 'CServe.quakenet.org') {
            if (event.message.startsWith('You are now logged in as ')) {
                client.once('displayed host', listener.displayedHostListener, {client, listener});
                client.mode(client.user.nick, '+x');
                client.removeListener('notice', listener.noticeListener);
            } else {
                client.emit('network services');
                client.removeListener('notice', listener.noticeListener);
            }
        }
    }

    displayedHostListener(this: Context<QuakenetHandler>, event: DisplayedHostEvent) {
        const {client, listener} = this;

        client.removeListener('displayed host', listener.displayedHostListener);
        client.emit('network services');
    }
}

const networks: Record<string, NetworkHandler> = {
    'quakenet.org': new QuakenetHandler(),
};

export {NetworkHandler, QuakenetHandler};
export default networks;
