interface CommandParam<T> {
    name: string,
    required: boolean;
    parse: ParserFn<T>;
}

type ParserFn<T, U = unknown> = (parts: string[], ...args: U[]) => ParamParseResult<T>;

type ParamParseResult<T> = ParamParseSuccess<T> | ParamParseError;

interface ParamParseSuccess<T> {
    value: T;
    consumed: string[];
}

interface ParamParseError {
    error: string;
}

export {CommandParam, ParamParseError, ParamParseResult, ParamParseSuccess, ParserFn};
