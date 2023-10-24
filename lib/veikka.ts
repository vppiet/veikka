import {Channel, Client, IrcClientOptions, JoinEvent} from 'irc-framework';

import {Command} from './command';
import {Publisher} from './publisher';

class Veikka extends Client {
    commands: Command[] = [];
    channels: Channel[] = [];
    publishers: Publisher[] = [];

    constructor(options?: IrcClientOptions) {
        super(options);
        this.addListener('join', this._joinListener);
        this.addListener('socket close', this._socketCloseListener);
    }

    _joinListener(event: JoinEvent) {
        if (event.nick !== this.user.nick) return;
        this.channels.push(this.channel(event.channel));
    }

    _socketCloseListener() {
        this.publishers.forEach((p) => p.stopTimer());
    }

    addCommand(...cmds: Command[]) {
        cmds.forEach((c) => this.addListener(c.getEventName(), c.listener,
            {client: this, listener: c}));
        cmds.forEach((c) => this.commands.push(c));

        return this;
    }

    addPublisher(publisher: Publisher) {
        this.addListener(publisher.getEventName(), publisher.listener,
            {client: this, listener: publisher});
        this.publishers.push(publisher);

        return this;
    }
}

export {Veikka};
