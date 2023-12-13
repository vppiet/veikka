import {PrivMsgEvent} from 'irc-framework';

import {Command} from '../command';

const BIRTHDAY_DATETIME = Date.parse('2023-10-13T13:00:00.000+03:00');

class InfoCommand extends Command<never> {
    constructor() {
        super('.', 'info', [
            '.info',
            'Kerro Veikan tiedot.',
        ]);
    }

    eventHandler(event: PrivMsgEvent): void {
        event.reply(this.createSay(
            `Liityin julkiselle serverille ensimmäisen kerran ${BIRTHDAY_DATETIME.toString()}`,
        ));
    }
}

export {InfoCommand};

