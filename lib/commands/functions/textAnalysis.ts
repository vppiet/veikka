const CONSONANTS = [
    'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
    'm', 'n', 'p', 'q', 'r', 's', 't', 'v',
];
const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y', 'ä', 'ö'];
const DIPHTHONGS = [
    'ai', 'ei', 'oi', 'äi', 'öi', 'ey', 'äy', 'öy', 'au',
    'eu', 'ou', 'ui', 'yi', 'iu', 'iy', 'ie', 'uo', 'yö',
];

const SYLLABLE_TYPES = [
    'CV', 'CVV', 'CVC', 'CVVC', 'CVCC',
    'CCV', 'CCVV', 'CCVVC', 'CCVC', 'CCVCC',
    'V', 'VV', 'VVC', 'VC', 'VCC',
];
const S_SYLLABLE_TYPES = ['CCVC', 'CCVCC']; // syllable starts with an 's'

type OverrideEntry = {
    before: string;
    after: string;
    shift: number;
    from: typeof DIRECTION[keyof typeof DIRECTION];
};

const DIRECTION = {
    LEFT: 'left',
    RIGHT: 'right',
} as const;

const OVERRIDES: {[key: string]: OverrideEntry[]} = {
    'CV': [{
        before: 'CV',
        after: 'CCV',
        replace: 'CVC',
    }, {
        before: '',
        after: 'CCV',
        replace: 'CVC',
    }, {
        before: 'CVC',
        after: 'C',
        replace: 'CVC',
    }, {
        before: '',
        after: 'V',
        replace: 'CVV',
    }, {
        before: 'CV',
        after: 'C',
        replace: 'CVC',
    }, {
        before: '',
        after: 'CCCV',
        replace: 'CVCC',
    }],
    'CVC': [{ // CV-CVC-VCCI -> CV-CV-CV
        before: 'CV',
        after: 'V',
        shift: -1,
        from: DIRECTION.LEFT,
    }],
};

// Sana:    ka-taf-a-lkki
// Väärin:  CV-CVC-V-CCCV

// Sana:    ka-ta-falk-ki
// Oikein:  CV-CV-CVCC-CV

function isAlphabet(char: string) {
    return [...VOWELS, ...CONSONANTS].includes(char);
}

function mapToVocalType(input: string) {
    let types = '';

    if (!input) {
        return types;
    }

    for (let i = 0; i < input.length; i++) {
        const char = input[i].toLowerCase();

        if (VOWELS.includes(char)) {
            types += 'V';
        } else if (CONSONANTS.includes(char)) {
            types += 'C';
        } else if (char === ' ') {
            types += ' ';
        } else {
            // special character placeholder
            types += '*';
        }
    }

    return types;
}

function getMatchingType(input: string, type: string) {
    const sti = SYLLABLE_TYPES.indexOf(type);
    if (sti !== -1) {
        return SYLLABLE_TYPES[sti];
    }

    if (input.toLowerCase().startsWith('s')) {
        const ssti = S_SYLLABLE_TYPES.indexOf(type);
        if (ssti !== -1) {
            return S_SYLLABLE_TYPES[ssti];
        }
    }

    return;
}

function getOverrideExpand(type: string, before = '', after = '') {
    if (type in OVERRIDES) {
        const o = OVERRIDES[type].find((o) => {
            return (!o.before || before.endsWith(o.before)) &&
                (!o.after || after.startsWith(o.after));
        });

        if (o) {
            return type.length - o.replace.length;
        }
    }

    return 0;
}

function getSyllables(input: string) {
    const words = input.trim().split(' ');
    console.log('words:', words);

    const syllables: string[] = [];

    for (const word of words) {
        let buffer = '';

        for (let i = 0; i < word.length; i++) {
            buffer += word[i];
            const type = mapToVocalType(buffer);
            const matchedType = getMatchingType(buffer, type);
            // console.log(`buffer: ${buffer} | type: ${type} | matchedType: ${matchedType}`);

            if (i !== word.length - 1 && matchedType) {
                const before = mapToVocalType(word.slice(0, i - buffer.length + 1));
                const after = mapToVocalType(word.slice(i + 1, word.length));
                const expand = getOverrideExpand(matchedType, before, after);
                // console.log([i, word.slice(0, i - buffer.length + 1), buffer, word.slice(i + 1, word.length), shift].join(' | '));

                // console.log(i, shift, buffer, word.slice(i - buffer.length + 1, i + shift + 1));
                let start = i - buffer.length + 1;
                let end = i + 1;

                if (expand < 0) {
                    start += expand;
                } else {
                    end += expand;
                }

                console.log(expand, word.slice(start, end));
                syllables.push(word.slice(start, end));
                buffer = '';

            }

            // console.log(syllables);
        }

        if (buffer) {
            syllables.push(buffer);
        }
    }

    return syllables;
}

export {getSyllables};
