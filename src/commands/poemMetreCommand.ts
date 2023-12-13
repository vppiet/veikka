import Database from 'bun:sqlite';
import { PrivMsgEvent } from '../types/irc-framework';

import { ARG_SEP, Command } from '../command';
import { CommandParam } from '../commandParam';
import { NounTable } from '../db/noun';
import { Closeable, Initialisable } from '../util';
import { Syllabificator } from './resources/textAnalysis';

class PoemMetreCommand extends Command<string> implements Initialisable, Closeable {
    nounTable: NounTable;
    syllabificator: Syllabificator;

    constructor(conn: Database) {
        super('.', 'runomitta', [
            '.runomitta <runo>',
            'Tavuta runo ja kerro runon poljennoton mitta. ' +
                'Vinoviiva ("/") runossa erottaa säkeen toisistaan.',
        ], [poemParam]);
        this.nounTable = new NounTable(conn);
        this.syllabificator = new Syllabificator(this.nounTable);
    }

    async initialise() {
        await this.nounTable.loadWords();
    }

    close() {
        this.nounTable.finalizeAll();
    }

    eventHandler(event: PrivMsgEvent, args: [string]) {
        const [poem] = args;
        const verses = poem.split('/')
            .map((verse) => {
                return verse.trim()
                    .split(' ')
                    .map((word) => this.syllabificator.getSyllables(word));
            });

        const metre = verses.map((v) => v.flat().length);

        const reply = [
            verses.map((v) => v.map((w) => w.join('-')).join(' ')).join(' / '),
            metre.join('-')];
        this.reply(event, ...reply);
    }
}

const poemParam: CommandParam<string> = {
    required: true,
    parse: function(parts: string[]) {
        const poem = parts.join(ARG_SEP);

        if (poem.length < 3) {
            return {error: 'Runossa on oltava vähintään kolme kirjainta.'};
        }

        return {value: poem, consumed: parts};
    },
};

export { PoemMetreCommand };

