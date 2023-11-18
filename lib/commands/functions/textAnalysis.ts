const CONSONANTS = ['b', 'c', 'd', 'f', 'g',
    'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v'];
const FOREIGN_CONSONANTS = ['b', 'c', 'd', 'f', 'g', 'q'];
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ö'];
const ALPHABETS = [...VOWELS, ...CONSONANTS];

const DIPHTHONGS = [
    'ai', 'au', 'ei', 'eu', 'ey', 'ie', 'iu', 'iy',
    'oi', 'ou', 'ui', 'uo', 'yi', 'yö', 'äi', 'äy',
    'öi', 'öy',
];
const FOREIGN_CLUSTER = ['br', 'fl', 'kl', 'kr', 'tr'];

function of(arr: string[], input: string) {
    if (!input || !input.length) {
        throw new Error(`Argument input was "${input}" and of type ${typeof input}`);
    }

    return arr.includes(input);
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
        } else {
            // TODO: non-v & non-c are handling
        }
    }

    return type;
}

function isType(input: string, type: string) {
    return mapType(input) === type;
}

const matchers: {[k: string]: (view: string, before: string, after: string, syllableN: number) =>
    boolean} = {
        'V': (view, before, after, syllableN) => {
            if (after[0]) {
                if (of(CONSONANTS, after[0])) {
                    if (after[1] && of(VOWELS, after[1])) {
                        return true;
                    }
                }

                if (of(VOWELS, after[0]) &&
                    view[0] !== after[0] && !DIPHTHONGS.includes(view[0] + after[0])) {
                    return true;
                }
            }

            return false;
        },
        'VC': (view, before, after, syllableN) => {
            if (after[0] && of(CONSONANTS, after[0]) &&
                !(after[1] && of(CONSONANTS, after[1]))) {
                return true;
            }

            return false;
        },
        'CV': (view, before, after, syllableN) => {
            if (after[0]) {
                if (of(CONSONANTS, after[0])) {
                    if (after[1] && of(VOWELS, after[1])) {
                        return true;
                    }
                }

                if (of(VOWELS, after[0])) {
                    if (view[1] !== after[0] && !of(DIPHTHONGS, view[1] + after[0])) {
                        return true;
                    }

                    if (view[1] === 'i' && of(DIPHTHONGS, view[1] + after[0])) {
                        if (after[1] && of(CONSONANTS, after[1]) && !after[2]) {
                            return true;
                        }

                        if (view[1] + after[0] === 'ie' && syllableN > 0) {
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
        'CVC': (view, before, after, syllableN) => {
            if (after[0] && after[1]) {
                if (of(CONSONANTS, after[0])) {
                    if (of(VOWELS, after[1])) {
                        return true;
                    }
                }

                if (after[0] + after[1] == 'tr') { // foreign
                    return true;
                }
            }

            return false;
        },
        'CVCC': (view, before, after, syllableN) => {
            if (after[0] && of(CONSONANTS, after[0])) {
                return true;
            }

            return false;
        },
        'CVV': (view, before, after, syllableN) => {
            if (DIPHTHONGS.includes(view.slice(1))) {
                if (after[0] && of(CONSONANTS, after[0]) && after[1] && of(VOWELS, after[1])) {
                    return true;
                }
            }

            if (view[1] === view[2] && after[1] && of(VOWELS, after[1])) {
                return true;
            }

            if (view[1] !== view[2] && after[0] && of(VOWELS, after[0])) {
                return true;
            }

            return false;
        },
        'CVVC': (view, before, after, syllableN) => {
            return true;
        },
        'VV': (view, before, after, syllableN) => {
            if (DIPHTHONGS.includes(view)) {
                return true;
            }

            return false;
        },
        'VCC': (view, before, after, syllableN) => {
            if (after[0] && of(CONSONANTS, after[0])) {
                return true;
            }

            return false;
        },
        'CCV': (view, before, after, syllableN) => { // foreign
            if (of(FOREIGN_CLUSTER, view[0] + view[1]) && after[0] &&
                of(FOREIGN_CONSONANTS, after[0])) {
                return true;
            }

            if (!of(FOREIGN_CLUSTER, view[0] + view[1])) {
                return true;
            }

            return false;
        },
        'CCVC': (view, before, after, syllableN) => {
            if (view[0] + view[1] == 'tr') {
                return true;
            }

            return false;
        },
        'CCVCC': (view, before, after, syllableN) => {
            return true;
        },
        'CCVV': (view, before, after, syllableN) => {
            if (view[2] === view[3] && after[0] && after[1] && isType(after[0] + after[1], 'CV')) {
                return true;
            }

            return false;
        },
        'CCVVC': (view, before, after, syllableN) => {
            return true;
        },
        'sCCVC': (view, before, after, syllableN) => {
            if (after[0] && view[4] == after[0]) {
                return true;
            }

            return false;
        },
        'sCCVCC': (view, before, after, syllableN) => {
            return true;
        },
    };

function isSyllable(view: string, before = '', after = '', syllableN: number) {
    const type = mapType(view);
    console.log(`finding handler for "${type}" "${view}"`);

    if (type in matchers) {
        console.log(`handler found for "${type}" "${view}"`);
        console.log({type, before, view, after}); // DEBUG
        return matchers[type](view, before, after, syllableN);
    }

    console.log(`handler not found for "${type}", returning to buffer`);
    return false;
}

function getWordSyllables(word: string) {
    word = word.trim();
    const syllables: string[] = [];
    let buffer = '';

    console.log('\n#####################', word, '#####################\n');

    for (let i = 0; i < word.length; i++) {
        buffer += word[i];

        if (i === word.length - 1) {
            syllables.push(buffer);
            console.log({syllables});
            continue;
        }

        const start = i - buffer.length + 1;
        const before = word.slice(0, start);
        const after = word.slice(before.length + buffer.length);

        if (isSyllable(buffer, before, after, syllables.length)) {
            syllables.push(buffer);
            buffer = '';
        }

        console.log({syllables});
    }

    return syllables;
}

export {getWordSyllables};
