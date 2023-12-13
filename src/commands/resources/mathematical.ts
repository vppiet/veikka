const ASSOCIATIVITY = {
    LEFT: 'L',
    RIGHT: 'R',
} as const;

class Operator {
    token: string;
    precedence: number;
    associativity: typeof ASSOCIATIVITY[keyof typeof ASSOCIATIVITY];
    fn: (a: number, b: number) => number;

    constructor(token: string, precedence: number,
        associativity: typeof ASSOCIATIVITY[keyof typeof ASSOCIATIVITY],
        fn: (a: number, b: number) => number) {
        this.token = token;
        this.precedence = precedence;
        this.associativity = associativity;
        this.fn = fn;
    }

    comparator(other: Operator) {
        return this.precedence - other.precedence;
    }
}

const OPERATORS: Record<string, Operator> = {
    '+': new Operator('+', 0, ASSOCIATIVITY.LEFT, (a, b) => a+b),
    '-': new Operator('-', 0, ASSOCIATIVITY.LEFT, (a, b) => a-b),
    '*': new Operator('*', 1, ASSOCIATIVITY.LEFT, (a, b) => a*b),
    '/': new Operator('/', 1, ASSOCIATIVITY.LEFT, (a, b) => a/b),
    '^': new Operator('^', 2, ASSOCIATIVITY.RIGHT, (a, b) => Math.pow(a, b)),
};

const SYMBOLS: Record<string, number> = {
    'pi': Math.PI,
    'e': Math.E,
};

const NUMBER_CHARS = '0123456789.';
const SUPPORTED_CHARS = NUMBER_CHARS + Object.keys(OPERATORS).join('');

// Implementation based on pseudo code in https://en.wikipedia.org/wiki/Shunting_yard_algorithm
function lexer(input: string) {
    const outputQue: (number | string)[] = [];
    const opStack: string[] = [];

    let buffer = '';
    const handleBuffer = () => {
        if (!buffer) return true;

        const x = Number.parseFloat(buffer);

        if (!Number.isNaN(x)) {
            outputQue.push(x);
        } else if (buffer in SYMBOLS) {
            outputQue.push(SYMBOLS[buffer]);
        } else {
            return false;
        }

        buffer = '';
        return true;
    };

    for (const char of input) {
        if (NUMBER_CHARS.includes(char)) {
            buffer += char;
            continue;
        }

        if (Object.keys(SYMBOLS).some((s) => s.startsWith(buffer + char))) {
            buffer += char;
            continue;
        }

        if (!handleBuffer()) {
            return {error: 'Parse error: unsupported token or invalid syntax'};
        }

        if (char in OPERATORS) {
            while (
                (opStack[0] && opStack[0] !== '(') &&
                (OPERATORS[opStack[0]].precedence > OPERATORS[char].precedence ||
                    (
                        OPERATORS[opStack[0]].precedence === OPERATORS[char].precedence &&
                        OPERATORS[char].associativity === ASSOCIATIVITY.LEFT
                    ))) {
                outputQue.push(opStack.shift()!);
            }

            opStack.unshift(char);
        } else if (char === '(') {
            opStack.unshift(char);
        } else if (char === ')') {
            while (opStack[0] !== '(') {
                if (opStack.length === 0) {
                    return {
                        error: 'Parse error: operation stack is empty while consuming right ' +
                            'parenthesis',
                    };
                }

                outputQue.push(opStack.shift()!);
            }

            opStack.shift();
        } else if (char === ' ') {
            continue;
        } else {
            return {
                error: 'Parse error: supported tokens were exhausted',
            };
        }
    }

    if (buffer) {
        handleBuffer();
    }

    outputQue.push(...opStack);

    return {tokens: outputQue};
}

function calculate(input: string) {
    const result = lexer(input);

    if ('error' in result) {
        return {error: result.error};
    }

    const tokens = result.tokens;
    const buffer: number[] = [];

    for (const t of tokens) {
        if (t in OPERATORS) {
            const b = buffer.pop();
            const a = buffer.pop();
            if (!b || !a) {
                return {error: 'Tokenisation error: token amount mismatch'};
            }

            const fn = OPERATORS[t].fn;
            buffer.push(fn(a, b));
        } else {
            buffer.push(Number(t));
        }
    }

    return {result: Number(buffer[0])};
}

export {SUPPORTED_CHARS, SYMBOLS, calculate, lexer};

