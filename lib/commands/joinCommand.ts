import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL, Params} from '../command';
import {Veikka} from 'veikka';

class JoinCommand extends Command {
    constructor() {
        super('.', 'liity', [
            '.liity <kanava>',
            'Liity kanavalle.',
        ], 1, 0, PRIVILEGE_LEVEL.ADMIN);
    }

    eventHandler(event: PrivMsgEvent, params: Params, client: Veikka): void {
        const target = params.req[0];

        // already in the buffer
        if (client.channels.findIndex((c) => c.name === target) !== -1) return;

        const channel = client.channel(target);
        channel.join();
        client.channels.push(channel);
    }
}

export {JoinCommand};
