import Database from 'bun:sqlite';
import {Logger} from 'winston';
import {PrivMsgEvent} from '../../types/irc-framework';

import {Command} from '../command';
import {NounTable} from '../db/noun';
import {Closeable, Context, Initialisable} from '../util';
import {Syllabificator} from './resources/textAnalysis';
import {Veikka} from 'veikka';
import {getLogger} from 'logger';

class PoemMetreCommand extends Command implements Initialisable, Closeable {
    nounTable: NounTable;
    logger: Logger;
    syllabificator: Syllabificator;

    constructor(conn: Database) {
        super('.', 'runomitta', [
            '.runomitta <runo>',
            'Tavuta runo ja kerro runon poljennoton mitta.' +
                'Vinoviiva runossa erottaa säkeen toisistaan.',
        ], 1);
        this.nounTable = new NounTable(conn);
        this.logger = getLogger('haikuCommand');
        this.syllabificator = new Syllabificator(this.nounTable);
    }

    async initialise(client: Veikka) {
        const count = this.nounTable.getCount.get()?.count;
        this.logger.debug(`${count} nouns in the database.`);

        if (count && count > 0) {
            // words in table - let's keep them
            return;
        }

        // eslint-disable-next-line max-len
        const response = await fetch('https://raw.githubusercontent.com/akx/fi-words/master/words/nouns.txt');
        let text: string | undefined = await response.text();

        let words: string[] | undefined = text.replaceAll('=', '').split('\n');
        text = undefined;

        // TODO: transaction function: somehow not finalized/garbage collected
        const insertCount = this.nounTable.insertMany(words);
        words = undefined;

        this.logger.debug(`Inserted ${insertCount} nouns.`);
    }

    close(client: Veikka): void {
        this.nounTable.finalizeAll();
    }

    getEventName() {
        return 'privmsg';
    }

    listener(this: Context<PoemMetreCommand>, event: PrivMsgEvent) {
        const cmd = this.listener;

        if (!cmd.match(event.message)) return;

        const {req} = cmd.parseParameters(event.message);
        const poem = req[0];

        if (poem.length < 3) {
            event.reply(cmd.createSay('Runossa on oltava vähintään kolme kirjainta.'));
            return;
        }

        const verses = poem.split('/')
            .map((verse) => {
                return verse.trim()
                    .split(' ')
                    .map((word) => cmd.syllabificator.getSyllables(word));
            });

        const metre: number[] = verses.map((v) => v.flat().length);

        const reply = cmd.createSay(
            verses.map((v) => v.map((w) => w.join('-')).join(' ')).join(' / '),
            metre.join('-'),
        );
        event.reply(reply);
    }
}

export {PoemMetreCommand};
