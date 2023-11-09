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

// Implementation based on pseudo code in https://en.wikipedia.org/wiki/Shunting_yard_algorithm
function lexer(input: string): {tokens: (number | string)[], error?: string} {
    const outputQue: (number | string)[] = [];
    const opStack: string[] = [];

    let buffer = '';
    const handleBuffer = () => {
        if (!buffer) return true;

        const x = Number.parseFloat(buffer);
        outputQue.push(x);
        buffer = '';
        return !Number.isNaN(x);
    };

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if ('0123456789.'.includes(char)) {
            buffer += char;
            continue;
        }

        if (!handleBuffer()) {
            return {
                tokens: outputQue,
                error: 'Parse error: unsupported token or invalid syntax',
            };
        }

        if (char in OPERATORS) {
            while (
                (opStack[0] && opStack[0] !== '(') &&
                (OPERATORS[opStack[0]].precedence > OPERATORS[char].precedence ||
                    (
                        OPERATORS[opStack[0]].precedence === OPERATORS[char].precedence &&
                        OPERATORS[char].associativity === ASSOCIATIVITY.LEFT
                    ))) {
                outputQue.push(opStack.shift() as string);
            }

            opStack.unshift(char);
        } else if (char === '(') {
            opStack.unshift(char);
        } else if (char === ')') {
            while (opStack[0] !== '(') {
                if (opStack.length === 0) {
                    return {
                        tokens: outputQue,
                        error: 'Parse error: operation stack is empty while consuming right ' +
                            'parenthesis',
                    };
                }

                outputQue.push(opStack.shift() as string);
            }

            opStack.shift();
        } else if (char === ' ') {
            continue;
        } else {
            return {
                tokens: outputQue,
                error: 'Parse error: supported tokens were exhausted',
            };
        }
    }

    if (buffer) {
        handleBuffer();
    }

    outputQue.push(...opStack);

    return {
        tokens: outputQue,
    };
}

function calculate(input: string): {result?: number, error?: string} {
    const {tokens, error} = lexer(input);

    if (error) {
        return {error};
    }

    const buffer: number[] = [];

    for (let i = 0; i < tokens.length; i++) {
        const t = tokens[i];

        if (t in OPERATORS) {
            const b = buffer.pop();
            const a = buffer.pop();
            if (!b || !a) {
                return {
                    error: 'Tokenisation error: token amount mismatch',
                };
            }

            const fn = OPERATORS[t].fn;
            buffer.push(fn(a, b));
        } else {
            buffer.push(Number(t));
        }
    }

    return {result: Number(buffer[0])};
}

export {lexer, calculate};
