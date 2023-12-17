import {ARG_SEP} from "../command";
import {ParserFn} from "../commandParam";

const parseStringHead: ParserFn<string, number> = (parts: string[], count: number) => {
    const headParts = parts.slice(0, count);
    return {value: headParts.join(ARG_SEP), consumed: headParts};
}

const parseStringTail: ParserFn<string> = (parts: string[]) => {
    return {value: parts.join(ARG_SEP), consumed: parts};
};

export {parseStringHead, parseStringTail};
