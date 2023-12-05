import {Command, Params} from 'command';
import {Veikka} from 'veikka';
import {PrivMsgEvent} from '../../types/irc-framework';

const BIRTHDAY_DATETIME = Date.parse('2023-10-13T13:00:00.000+03:00');

class InfoCommand extends Command {
    eventHandler(event: PrivMsgEvent, params: Params, client: Veikka): void {
        throw new Error('Method not implemented.');
    }
}

export {InfoCommand};
