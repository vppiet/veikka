import { PrivMsgEvent } from '../types/irc-framework';

import { ARG_SEP, Command, PRIVILEGE_LEVEL } from '../command';
import { CommandParam } from '../commandParam';
import { Veikka } from '../veikka';

class QuitCommand extends Command<string> {
    constructor() {
        super('.', 'sulje', [
            '.sulje [viesti]',
            'Sulje botti.',
        ], [quitMsgParam], PRIVILEGE_LEVEL.ADMIN);
    }

    parseArgument(message: string) {
        return this.getMsgTail(message);
    }

    eventHandler(event: PrivMsgEvent, args: [string], client: Veikka) {
        const [quitMsg] = args;

        if (quitMsg) {
            client.quit(quitMsg);
        } else {
            client.quit(Bun.env.QUIT_MSG);
        }
    }
}

const quitMsgParam: CommandParam<string> = {
    required: false,
    parse: function(parts: string[]) {
        const quitMsg = parts.join(ARG_SEP);
        if (quitMsg) {
            return {value: quitMsg, consumed: parts};
        }

        return {error: 'Quit-viesti puuttuu.'};
    },
};

export { QuitCommand };

