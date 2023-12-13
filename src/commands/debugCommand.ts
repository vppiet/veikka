import {generateHeapSnapshot} from 'bun';
import {heapStats} from 'bun:jsc';
import {PrivMsgEvent} from 'irc-framework';

import {Command, PRIVILEGE_LEVEL} from '../command';
import {CommandParam} from '../commandParam';

class DebugCommand extends Command<string> {
    constructor() {
        super('.', 'debug', [
            '.debug [toiminto]',
            'Lokita muistinkäyttö',
        ], [operationParam], PRIVILEGE_LEVEL.ADMIN);
    }

    async eventHandler(event: PrivMsgEvent, args: [string]) {
        const [operation] = args;

        if (operation === 'snapshot') {
            const snapshot = generateHeapSnapshot();
            const path = `./logs/heap-${new Date().toISOString()}.json`;
            const bytes = await Bun.write(path, JSON.stringify(snapshot, null, 2));

            this.logger.debug(`Generated heap snapshot to ${path} (${bytes} bytes)`);
        } else {
            this.logger.debug(heapStats());
        }
    }
}

const operationParam: CommandParam<string> = {
    required: false,
    parse: function(parts: string[]) {
        return {value: parts[0], consumed: [parts[0]]};
    },
};

export {DebugCommand};

