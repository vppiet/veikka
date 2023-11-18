import {Context} from '../util';
import {PrivMsgEvent} from '../../types/irc-framework';
import {Command} from '../command';
import {getWordSyllables} from './resources/textAnalysis';

class SyllablesCommand extends Command {
    constructor() {
        super('.', 'tavut', [
            '.tavut <sana>',
            'Hae sanan tavut.',
            'Ei tue tällä hetkellä: yhdyssanoja, etuliitteitä tai erikoismerkkejä.',
        ], 1);
    }

    getEventName() {
        return 'privmsg';
    }

    listener(this: Context<SyllablesCommand>, event: PrivMsgEvent) {
        const cmd = this.listener;

        if (!cmd.match(event.message)) return;

        const {req} = cmd.parseParameters(event.message);
        const word = req[0].trim();

        if (word.length < 3) {
            event.reply(cmd.createSay('Sanassa on oltava vähintään kolme kirjainta.'));
            return;
        }

        const syllables = getWordSyllables(word);
        const say = syllables.join('-');

        event.reply(cmd.createSay(say));
    }
}

export {SyllablesCommand};
