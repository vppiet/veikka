import {NounTable} from '../../db/noun';

const CONSONANTS = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k',
    'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'];
const FOREIGN_CONSONANTS = ['b', 'c', 'd', 'f', 'g', 'q'];
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ö'];
const ALPHABETS = [...VOWELS, ...CONSONANTS];

const DIPHTHONGS = [
    'ai', 'au', 'ei', 'eu', 'ey', 'ie', 'iu', 'iy',
    'oi', 'ou', 'ui', 'uo', 'yi', 'yö', 'äi', 'äy',
    'öi', 'öy',
];
const FOREIGN_CLUSTER = ['br', 'fl', 'fr', 'kl', 'kr', 'tr'];

const SEGMENT_SEPARATORS = ['\'', '-'];

function of(arr: string[], input: string) {
    if (!input || !input.length) {
        throw new Error(`Argument input was "${input}" and of type ${typeof input}`);
    }

    return arr.includes(input.toLowerCase());
}

function mapType(input: string) {
    let type = '';

    for (let i = 0; i < input.length; i++) {
        const char = input[i].toLowerCase();
        if (i === 0 && char === 's' && isType(input.slice(1, 3), 'CC')) {
            type += 's';
        } else if (of(VOWELS, char)) {
            type += 'V';
        } else if (of(CONSONANTS, char)) {
            type += 'C';
        }
    }

    return type;
}

function isType(input: string, type: string) {
    return mapType(input) === type;
}

const MATCHERS: {[k: string]: (view: string, before: string, after: string) => boolean} = {
    'V': (view, before, after) => {
        if (after[0]) {
            if (of(CONSONANTS, after[0])) {
                if (after[1] && of(VOWELS, after[1])) {
                    return true;
                }

                if (after[1] && of(FOREIGN_CLUSTER, after[0] + after[1])) {
                    return true;
                }
            }

            if (of(VOWELS, after[0]) && view[0] !== after[0] &&
                !of(DIPHTHONGS, view[0] + after[0])) {
                return true;
            }
        }

        return false;
    },
    'VC': (view, before, after) => {
        if (after[0] && of(CONSONANTS, after[0]) &&
            !(after[1] && of(CONSONANTS, after[1]))) {
            return true;
        }

        return false;
    },
    'CV': (view, before, after) => {
        if (after[0]) {
            if (of(CONSONANTS, after[0]) && after[1]) {
                if (of(FOREIGN_CLUSTER, after[0] + after[1]) && after[0] + after[1] !== 'tr') {
                    return true;
                }

                if (of(VOWELS, after[1])) {
                    return true;
                }
            }

            if (of(VOWELS, after[0])) {
                if (view[1] !== after[0]) {
                    if (view[1] + after[0] === 'ie' && before.length > 0 && view[0] !== 't') {
                        return true;
                    }

                    if (!of(DIPHTHONGS, view[1] + after[0])) {
                        return true;
                    }
                }

                if (!after[1]) {
                    if (before.length === 1) {
                        return true;
                    }

                    if (after[0] !== 'i' && view[1] !== after[0]) {
                        return true;
                    }
                }
            }
        }

        return false;
    },
    'CVC': (view, before, after) => {
        if (after[0] && after[1]) {
            if (of(CONSONANTS, after[0])) {
                if (of(VOWELS, after[1])) {
                    return true;
                }
            }

            if (after[0] + after[1] == 'tr') { // foreign
                return true;
            }

            if (before[before.length - 1] === 's' && view[2] === 's') {
                return true;
            }
        }

        return false;
    },
    'CVCC': (view, before, after) => {
        if (after[0] && of(CONSONANTS, after[0])) {
            return true;
        }

        return false;
    },
    'CVV': (view, before, after) => {
        if (of(DIPHTHONGS, view.slice(1))) {
            if (after[0] && of(CONSONANTS, after[0]) && after[1] && of(VOWELS, after[1])) {
                return true;
            }
        }

        if (view[1] === view[2]) {
            if (after[0]) {
                if (of(VOWELS, after[0])) {
                    return true;
                }

                if (of(CONSONANTS, after[0]) && after[1] && of(VOWELS, after[1])) {
                    return true;
                }
            }
        }

        if (view[1] !== view[2] && after[0] && of(VOWELS, after[0])) {
            return true;
        }

        return false;
    },
    'CVVC': (view, before, after) => {
        return true;
    },
    'VV': (view, before, after) => {
        if (after[0] && after[1] && isType(after[0] + after[1], 'CV')) {
            return true;
        }

        if (of(DIPHTHONGS, view) && before.length === 0) {
            return true;
        }

        return false;
    },
    'VVC': (view, before, after) => {
        return true;
    },
    'VCC': (view, before, after) => {
        if (after[0] && of(CONSONANTS, after[0])) {
            return true;
        }

        return false;
    },
    'CCV': (view, before, after) => { // foreign
        if (of(FOREIGN_CLUSTER, view[0] + view[1]) && after[0] &&
            of(FOREIGN_CONSONANTS, after[0])) {
            return true;
        }

        if (!of(FOREIGN_CLUSTER, view[0] + view[1])) {
            return true;
        }

        return false;
    },
    'CCVC': (view, before, after) => {
        if (of(FOREIGN_CLUSTER, view[0] + view[1]) &&
            !(after[0] && after[1] && isType(after[0] + after[1], 'CC') &&
            after[0] === after[1])) {
            return true;
        }

        return false;
    },
    'CCVCC': (view, before, after) => {
        return true;
    },
    'CCVV': (view, before, after) => {
        if (view[2] === view[3] && after[0] && after[1] && isType(after[0] + after[1], 'CV')) {
            return true;
        }

        return false;
    },
    'CCVVC': (view, before, after) => {
        return true;
    },
    'sCCVC': (view, before, after) => {
        if (after[0] && view[4] == after[0]) {
            return true;
        }

        return false;
    },
    'sCCVCC': (view, before, after) => {
        return true;
    },
};

/** @this Syllabificator */
function segmentSplitter(this: Syllabificator, str: string) {
    const segments: string[] = [];

    let segment = '';
    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (of(SEGMENT_SEPARATORS, char)) {
            if (i == 0 && i === str.length - 1) {
                continue;
            } else {
                segments.push(segment);
                segment = '';
                continue;
            }
        }

        segment += char;

        if (segment.length >= 3) {
            const after = str.slice(i + 1);
            const noun = this.getNounByBegin(segment, after);

            if (noun) {
                const start = i - segment.length;
                const end = start + noun.length;
                segments.push(str.slice(i - segment.length + 1, end + 1));
                i = end;
                segment = '';
            }
        }
    }

    if (segment) {
        segments.push(segment);
    }

    return segments;
}

class Syllabificator {
    splitter = {[Symbol.split]: segmentSplitter.bind(this)};
    nounTable: NounTable;

    constructor(nounTable: NounTable) {
        this.nounTable = nounTable;
    }

    getSyllables(input: string) {
        const segments = input.split(this.splitter);
        const syllables: string[] = [];

        for (const segment of segments) {
            let buffer = '';

            for (let i = 0; i < segment.length; i++) {
                buffer += segment[i];

                if (i === segment.length - 1) {
                    syllables.push(buffer);
                    continue;
                }

                const start = i - buffer.length + 1;
                const before = segment.slice(0, start);
                const after = segment.slice(before.length + buffer.length);

                if (this.isSyllable(buffer, before, after)) {
                    syllables.push(buffer);
                    buffer = '';
                }
            }
        }

        return syllables;
    }

    isSyllable(view: string, before = '', after = '') {
        const type = mapType(view);

        if (type in MATCHERS) {
            return MATCHERS[type](view, before, after);
        }

        return false;
    }

    getNounByBegin(begin: string, after: string) {
        const str = begin + (after !== undefined ? after : '');
        const rows = this.nounTable.getAllByBegin.all(begin);
        const matches = rows.map((r) => r.word)
            .filter((w) => str.startsWith(w))
            .sort((a, b) => b.length - a.length);

        return matches[0] ? matches[0] : '';
    }
}

export {Syllabificator};
