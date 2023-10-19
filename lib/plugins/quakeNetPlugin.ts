import {NoticeEvent, RegisteredEvent, DisplayedHostEvent} from 'irc-framework';

import {Veikka} from 'veikka';
import {IrcEventListener} from 'listener';

type Context = {
    client: Veikka;
    listener: QuakeNetRegister;
};

class QuakeNetRegister implements IrcEventListener {
    autojoinChannels: string[] = [];

    getEventName() {
        return 'registered';
    }

    listener(this: Context, event: RegisteredEvent) {
        this.client.addListener('notice', this.listener.noticeListener, this);
        this.client.say(
            'Q@CServe.quakenet.org',
            `AUTH ${Bun.env['QUAKENET_USER']} ${Bun.env['QUAKENET_PASSWD']}`,
        );
    }

    noticeListener(this: Context, event: NoticeEvent) {
        if (event.message.startsWith('You are now logged in as ') &&
        event.ident == 'TheQBot' &&
        event.hostname === 'CServe.quakenet.org') {
            this.client.once('displayed host', this.listener.displayedHostListener, this);
            this.client.mode(this.client.user.nick, '+x');
            this.client.removeListener('notice', this.listener.noticeListener);
        }
    }

    displayedHostListener(this: Context, event: DisplayedHostEvent) {
        if (event.hostname.endsWith('.users.quakenet.org')) {
            this.client.removeListener('displayed host', this.listener.displayedHostListener);
            this.client.removeListener(this.listener.getEventName(), this.listener.listener);

            this.client.addListener('ready for autojoin', this.listener.autojoin, this);
            this.client.emit('ready for autojoin');
        }
    }

    autojoin(this: Context) {
        this.listener.autojoinChannels.forEach((c) => this.client.join(c));
        this.client.removeListener('ready for autojoin', this.listener.autojoin);
    }

    addAutoJoin(...channels: string[]) {
        this.autojoinChannels.push(...channels);
    }
}

export {QuakeNetRegister};
