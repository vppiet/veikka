import Database from 'bun:sqlite';
import {PrivMsgEvent} from '../../types/irc-framework';

import {Command, Params} from '../command';
import {NounTable} from '../db/noun';
import {Closeable, Initialisable} from '../util';
import {Syllabificator} from './resources/textAnalysis';
import {Veikka} from '../veikka';

class PoemMetreCommand extends Command implements Initialisable, Closeable {
    nounTable: NounTable;
    syllabificator: Syllabificator;

    constructor(conn: Database) {
        super('.', 'runomitta', [
            '.runomitta <runo>',
            'Tavuta runo ja kerro runon poljennoton mitta. ' +
                'Vinoviiva ("/") runossa erottaa säkeen toisistaan.',
        ], 1);
        this.nounTable = new NounTable(conn);
        this.syllabificator = new Syllabificator(this.nounTable);
    }

    async initialise(client: Veikka) {
        await this.nounTable.loadWords();
    }

    close(client: Veikka) {
        this.nounTable.finalizeAll();
    }

    eventHandler(event: PrivMsgEvent, params: Params) {
        const poem = params.req[0];

        if (poem.length < 3) {
            event.reply(this.createSay('Runossa on oltava vähintään kolme kirjainta.'));
            return;
        }

        const verses = poem.split('/')
            .map((verse) => {
                return verse.trim()
                    .split(' ')
                    .map((word) => this.syllabificator.getSyllables(word));
            });

        const metre = verses.map((v) => v.flat().length);

        const reply = this.createSay(
            verses.map((v) => v.map((w) => w.join('-')).join(' ')).join(' / '),
            metre.join('-'),
        );
        event.reply(reply);
    }
}

export {PoemMetreCommand};
