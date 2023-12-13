import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL} from '../command';
import {CommandParam} from '../commandParam';
import {Veikka} from '../veikka';

class JoinCommand extends Command<string> {
    constructor() {
        super('.', 'liity', [
            '.liity <kanava>',
            'Liity kanavalle.',
        ], [channelParam], PRIVILEGE_LEVEL.ADMIN);
    }

    eventHandler(event: PrivMsgEvent, args: [string], client: Veikka) {
        const [channel] = args;

        // already in the buffer
        if (client.channels.findIndex((c) => c.name === channel) !== -1) {
            return;
        }

        const channelObj = client.channel(channel);
        channelObj.join();
        client.channels.push(channelObj);
    }
}

const channelParam: CommandParam<string> = {
    required: true,
    parse: function(parts: string[]) {
        if (!parts[0]) {
            return {error: 'Kanava puuttuu'};
        }

        if (!parts[0].startsWith('#')) {
            return {error: 'Kanavan on alettava #-merkillä'};
        }

        return {value: parts[0], consumed: [parts[0]]};
    },
};

export {JoinCommand};

