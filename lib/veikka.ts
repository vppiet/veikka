import {Client, IrcClientOptions} from 'irc-framework';

import {Command} from './command';

class Veikka extends Client {
    autojoin: string[] = [];
    commands: Command[] = [];

    constructor(options?: IrcClientOptions) {
        super(options);
    }

    addAutojoin(...channels: string[]) {
        this.autojoin.push(...channels);
    }

    addCommand(...cmds: Command[]) {
        cmds.forEach((c) => this.addListener(
            c.getEventName(),
            c.listener,
            {client: this, listener: c},
        ));

        this.commands.push(...cmds);
    }
}

export {Veikka};
