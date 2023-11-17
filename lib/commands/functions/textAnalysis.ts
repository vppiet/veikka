const CONSONANTS = ['b', 'c', 'd', 'f', 'g',
    'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v'];
function isConsonant(char: string) {
    if (!char) {
        throw new Error(`Argument "char" was ${typeof char}`);
    }

    return CONSONANTS.includes(char);
}

const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ö'];
function isVowel(char: string) {
    return VOWELS.includes(char);
}

const ALPHABETS = [...VOWELS, ...CONSONANTS];
function isAlphabet(char: string) {
    if (!char) {
        throw new Error(`Argument "char" was ${typeof char}`);
    }

    return ALPHABETS.includes(char);
}

const DIPHTHONGS = [
    'ai', 'au', 'ei', 'eu', 'ey', 'ie', 'iu', 'iy',
    'oi', 'ou', 'ui', 'uo', 'yi', 'yö', 'äi', 'äy',
    'öi', 'öy',
];
function isDiphthong(str: string) {
    if (!str) {
        throw new Error(`Argument "str" was ${typeof str}`);
    }

    return DIPHTHONGS.includes(str);
}

const SYLLABLE_TYPES = [
    'cv', 'cvc', 'cvcc', 'cvv', 'cvvc',
    'v', 'vc', 'vcc', 'vv', 'vvc',
    'ccv', 'ccvc', 'ccvcc', 'ccvv', 'ccvvc',
];
const S_SYLLABLE_TYPES = ['ccvc', 'ccvcc']; // syllable starts with an 's'

function mapType(input: string) {
    let type = '';

    for (let i = 0; i < input.length; i++) {
        const char = input[i].toLowerCase();
        if (isVowel(char)) {
            type += 'v';
        } else if (isConsonant(char)) {
            type += 'c';
        } else {
            // TODO: non-v & non-c are handling
        }
    }

    return type;
}

const matchers: {[k: string]: (view: string, before: string, after:string) => boolean} = {
    v: (view, before, after) => {
        if (isConsonant(after[0])) {
            if (isVowel(after[1])) {
                return true;
            }
        }

        // a ort ta
        if (after[0] && isVowel(after[0]) &&
            view[0] !== after[0] && !isDiphthong(view[0] + after[0])) {
            return true;
        }

        return false;
    },
    vc: (view, before, after) => {
        if (isConsonant(after[0]) &&
            !(after[1] && isConsonant(after[1]))) {
            return true;
        }

        return false;
    },
    cv: (view, before, after) => {
        if (isConsonant(after[0])) {
            if (isVowel(after[1])) {
                return true;
            }
        }

        if (isVowel(after[0])) {
            if (view[1] !== after[0] && !isDiphthong(view[1] + after[0])) {
                return true;
            }

            if (view[1] === 'i' && isDiphthong(view[1] + after[0])) {
                if (after[1] && isConsonant(after[1]) && !after[2]) {
                    return true;
                }
            }

            if (!after[1] && before.length === 1) {
                return true;
            }
        }

        return false;
    },
    // ka tas trofi
    cvc: (view, before, after) => {
        if (after[0] && after[1]) {
            if (isConsonant(after[0])) {
                if (isVowel(after[1])) {
                    return true;
                }
            }

            if (after[0] + after[1] == 'tr') { // foreign
                return true;
            }
        }

        return false;
    },
    cvcc: (view, before, after) => {
        if (after[0] && isConsonant(after[0])) {
            return true;
        }

        return false;
    },
    cvv: (view, before, after) => {
        if (isDiphthong(view.slice(1))) {
            if (after[0] && isConsonant(after[0]) && after[1] && isVowel(after[1])) {
                return true;
            }
        }

        if (view[1] === view[2] && after[1] && isVowel(after[1])) {
            return true;
        }

        if (view[1] !== view[2] && after[0] && isVowel(after[0])) {
            return true;
        }

        return false;
    },
    cvvc: (view, before, after) => {
        return true;
    },
    vv: (view, before, after) => {
        if (isDiphthong(view)) {
            return true;
        }

        return false;
    },
    vcc: (view, before, after) => {
        if (after[0] && isConsonant(after[0])) {
            return true;
        }

        return false;
    },
    ccv: (view, before, after) => {
        return true;
    },
    // xx: (view, before, after) => {
    //     return false;
    // },
};

function isSyllable(view: string, before = '', after = '') {
    const type = mapType(view);
    console.log(`finding handler for "${type}" "${view}"`);

    if (type in matchers) {
        console.log(`handler found for "${type}" "${view}"`);
        console.log({type, before, view, after}); // DEBUG
        return matchers[type](view, before, after);
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

        if (isSyllable(buffer, before, after)) {
            syllables.push(buffer);
            buffer = '';
        }

        console.log({syllables});
    }

    return syllables;
}

export {getWordSyllables};
