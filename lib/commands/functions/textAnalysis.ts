import {PropertyValue} from '../../util';

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

type Operation = {
    shift: number;
    side: PropertyValue<typeof SIDE>,
};

type VocalTypeHandler = (before: string, after: string) => Operation;

const SIDE = {
    LEFT: 'left',
    RIGHT: 'right',
} as const;

const NO_SHIFT_OP: Operation = {
    shift: 0,
    side: SIDE.LEFT,
};

/*
    Priority:
    1. before > after
    2. equal > endsWith/startsWith
*/
const VOCAL_TYPE_HANDLERS: {[key: string]: VocalTypeHandler} = {
    'CV': (before, after) => {
        if (before === 'V') {
            if (after.startsWith('CCC')) return {shift: 2, side: SIDE.RIGHT};
        }

        if (after === 'C') {
            return {shift: 1, side: SIDE.RIGHT};
        }

        if (after === 'V') {
            return {shift: 1, side: SIDE.RIGHT};
        }

        if (before.endsWith('CVCV')) {
            if (after.startsWith('CCCV')) return {shift: 2, side: SIDE.RIGHT};
        }

        if (before.endsWith('CVC')) {
            if (after === 'C') return {shift: 1, side: SIDE.RIGHT};
            if (after.startsWith('VCVC')) return {shift: 1, side: SIDE.RIGHT};
        }

        if (before.endsWith('CVV')) {
            if (after === 'C') return {shift: 1, side: SIDE.RIGHT};
        }

        if (before.endsWith('CV')) {
            if (after.startsWith('CCV')) return {shift: 1, side: SIDE.RIGHT};
        }

        if (after.startsWith('CCV')) {
            return {shift: 1, side: SIDE.RIGHT};
        }

        if (after.startsWith('CCC')) {
            return {shift: 2, side: SIDE.RIGHT};
        }

        if (after.startsWith('VCV')) {
            return {shift: 1, side: SIDE.RIGHT};
        }

        return NO_SHIFT_OP;
    },
    'V': (before, after) => {
        if (after.startsWith('CCV')) {
            return {shift: 1, side: SIDE.RIGHT};
        }

        return NO_SHIFT_OP;
    },
    // 'CV': [{
    //     before: 'CV',
    //     after: 'CCV',
    //     // replace: 'CVC',
    //     operation: {
    //         shift: 0,
    //         side: SIDE.LEFT,
    //     },
    // }, {
    //     before: '',
    //     after: 'CCV',
    //     // replace: 'CVC',
    //     operation: {
    //         shift: 0,
    //         side: SIDE.LEFT,
    //     },
    // }, {
    //     before: 'CVC',
    //     after: 'C',
    //     // replace: 'CVC',
    //     operation: {
    //         shift: 0,
    //         side: SIDE.LEFT,
    //     },
    // }, {
    //     before: '',
    //     after: 'V',
    //     // replace: 'CVV',
    //     operation: {
    //         shift: 0,
    //         side: SIDE.LEFT,
    //     },
    // }, {
    //     before: 'CV',
    //     after: 'C',
    //     noAfter: 'CVCCCV',
    //     // replace: 'CVC',
    //     operation: {
    //         shift: 0,
    //         side: SIDE.LEFT,
    //     },
    // }, {
    //     before: 'CVCV',
    //     after: 'CCCV',
    //     operation: {
    //         shift: -1,
    //         side: SIDE.RIGHT,
    //     },
    // }],
    // 'CVC': [{ // CV-CVC-VCCI -> CV-CV-CV
    //     before: 'CV',
    //     after: 'V',
    //     operation: {
    //         shift: -1,
    //         side: SIDE.RIGHT,
    //     },
    // }],
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

function getOperation(type: string, before = '', after = ''): Operation {
    if (type in VOCAL_TYPE_HANDLERS) {
        const op = VOCAL_TYPE_HANDLERS[type];

        if (op) {
            return op(before, after);
        }
    }

    return NO_SHIFT_OP;
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
                const after = mapToVocalType(word.slice(before.length + buffer.length));
                const op = getOperation(matchedType, before, after);

                // eslint-disable-next-line max-len
                console.log(before, type, after, word.slice(0, i - buffer.length + 1), word.slice(before.length + buffer.length), op);

                // eslint-disable-next-line max-len
                // console.log([i, word.slice(0, i - buffer.length + 1), buffer, word.slice(i + 1, word.length), shift].join(' | '));
                // console.log(before, matchedType, after);
                // console.log(i, shift, buffer, word.slice(i - buffer.length + 1, i + shift + 1));
                let start = i - buffer.length + 1;
                let end = start + buffer.length;

                // SIDE
                // left:    +expands, -shrinks
                // right:   +expands, -shrinks
                if (op.side === SIDE.LEFT) {
                    start -= op.shift;
                } else {
                    end += op.shift;
                    i += op.shift;
                }

                // console.log('selected', op, buffer, i, start, end, word.slice(start, end));
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
