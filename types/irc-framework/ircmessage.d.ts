type Tags = unknown;

export default class IrcMessage {
    constructor(command: string, ...args: Array<unknown>); //
    tags: Tags;
    prefix: string;
    nick: string;
    ident: string;
    hostname: string;
    command: string;
    params: Array<string>;
}
