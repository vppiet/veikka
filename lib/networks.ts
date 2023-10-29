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
        client.say(
            'Q@CServe.quakenet.org',
            `AUTH ${user} ${pwd}`,
        );
    }

    /*
    unsuccessful case:
        12:23:09 -!- Irssi: Starting query in QuakeNet with Q@CServe.quakenet.org
        12:23:09 <ville_> AUTH ville_ foobar
        12:23:09 [QuakeNet] -Q(TheQBot@CServe.quakenet.org)- Username or password incorrect.
    */
    noticeListener(this: Context<QuakenetHandler>, event: NoticeEvent) {
        if (event.ident === 'TheQBot' && event.hostname === 'CServe.quakenet.org') {
            if (event.message.startsWith('You are now logged in as ')) {
                this.client.once('displayed host', this.listener.displayedHostListener, this);
                this.client.mode(this.client.user.nick, '+x');
                this.client.removeListener('notice', this.listener.noticeListener);
            } else {
                this.client.emit('network services');
                this.client.removeListener('notice', this.listener.noticeListener);
            }
        }
    }

    displayedHostListener(this: Context<QuakenetHandler>, event: DisplayedHostEvent) {
        this.client.removeListener('displayed host', this.listener.displayedHostListener);
        this.client.emit('network services');
    }
}

const NETWORKS: Record<string, NetworkHandler> = {
    'quakenet.org': new QuakenetHandler(),
};

export {NetworkHandler, QuakenetHandler};
export default NETWORKS;
