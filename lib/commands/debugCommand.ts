import {PrivMsgEvent} from '../../types/irc-framework';
import {Logger} from 'winston';
import {generateHeapSnapshot} from 'bun';
import {heapStats} from 'bun:jsc';

import {Command, PRIVILEGE_LEVEL} from '../command';
import {getLogger} from 'logger';
import {Context} from '../util';

class DebugCommand extends Command {
    logger: Logger;

    constructor() {
        super('.', 'debug', ['.debug', 'Lokita muistinkäyttö'], 1, 0, PRIVILEGE_LEVEL.ADMIN);
        this.logger = getLogger('debugCommand');
    }

    getEventName(): string {
        return 'privmsg';
    }

    async listener(this: Context<DebugCommand>, event: PrivMsgEvent) {
        const cmd = this.listener;

        if (!cmd.match(event.message, event.ident, event.hostname)) return;

        const {req} = cmd.parseParameters(event.message);
        const operation = req[0];

        if (operation === 'snapshot') {
            const snapshot = generateHeapSnapshot();
            const path = `./logs/heap-${new Date().toISOString()}.json`;
            const bytes = await Bun.write(path, JSON.stringify(snapshot, null, 2),
            );
            cmd.logger.debug(`Generated heap snapshot to ${path} (${bytes} bytes)`);
        } else if (operation === 'heap') {
            cmd.logger.debug(heapStats());
        }
    }
}

export {DebugCommand};
