import {PrivMsgEvent} from '../../types/irc-framework';
import {Logger} from 'winston';
import {generateHeapSnapshot} from 'bun';
import {heapStats} from 'bun:jsc';

import {Command, PRIVILEGE_LEVEL, Params} from '../command';
import {getLogger} from 'logger';

class DebugCommand extends Command {
    logger: Logger;

    constructor() {
        super('.', 'debug', ['.debug', 'Lokita muistinkäyttö'], 1, 0, PRIVILEGE_LEVEL.ADMIN);
        this.logger = getLogger('debugCommand');
    }

    async eventHandler(event: PrivMsgEvent, params: Params) {
        const operation = params.req[0];

        if (operation === 'snapshot') {
            const snapshot = generateHeapSnapshot();
            const path = `./logs/heap-${new Date().toISOString()}.json`;
            const bytes = await Bun.write(path, JSON.stringify(snapshot, null, 2),
            );
            this.logger.debug(`Generated heap snapshot to ${path} (${bytes} bytes)`);
        } else if (operation === 'heap') {
            this.logger.debug(heapStats());
        }
    }
}

export {DebugCommand};
