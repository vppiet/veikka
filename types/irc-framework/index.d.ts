import {EventEmitter} from 'eventemitter3';

export type IrcClientOptions = {
    nick?: string;
    username?: string;
    gecos?: string;
    host?: string;
    port?: number;
    encoding?: string;
    version?: string;
    enable_chghost?: boolean;
    enable_echomessage?: boolean;
    auto_reconnect?: boolean;
    auto_reconnect_max_wait?: number;
    auto_reconnect_max_retries?: number;
    ping_interval?: number;
    ping_timeout?: number;
    sasl_disconnect_on_fail?: boolean;
    account?: {
        account: string;
        password: string;
    },
    webirc?: {
        password: string;
        username: string;
        hostname: string;
        address: string;
        options?: {
            secure?: boolean;
            'local-port'?: number;
            'remote-port'?: number;
        },
    },
    client_certificate?: {
        private_key: string;
        certificate: string;
    },
}

export type User = {
    nick: string;
    username: string;
    gecos: string;
    host: string;
    away: string;
    modes: Set<string>;
};

type IrcMessage = {
    tags: Tags;
    prefix: string;
    nick: string;
    ident: string;
    hostname: string;
    command: string;
};

export type Channel = {
    irc_client: IrcClient;
    name: string;
    say(message: string, tags?: Tags): void;
    notice(message: string, tags?: Tags): void;
    part(message: string): void
    join(key?: string): void;
    mode(mode: string, extra_args?: unknown[]): void;
    banlist(cb?: (event: BanListEvent) => void): void;
    ban(mask: string): void;
    unban(mask: string): void;
};

type Tags = Record<string, string>;

type EventType = 'registered' | 'connected' | 'reconnecting' | 'close' | 'socket close' | 'socket connected' | 'raw socket connected' | 'server options' | 'raw' | 'unknown command' | 'debug' | 'channel info' | 'channel list start' | 'channel list' | 'channel list end' | 'channel info' | 'wholist' | 'userlist' | 'invitelist' | 'banlist' | 'exceptlist' | 'topic' | 'topicsetby' | 'join' | 'part' | 'kick' | 'quit' | 'invited' | 'message' | 'notice' | 'action' | 'privmsg' | 'tagmsg' | 'ctcp response' | 'ctcp request' | 'wallops' | 'nick' | 'account' | 'user info' | 'away' | 'back' | 'monitorlist' | 'nick in use' | 'nick invalid' | 'user online' | 'user offline' | 'whois' | 'whowas' | 'user updated' | 'motd' | 'info' | 'help' | 'batch start' | 'batch end' | 'cap ls' | 'cap ack' | 'cap nak' | 'cap list' | 'cap new' | 'cap del' | 'loggedin' | 'loggedout' | 'sasl failed';

export type RegisteredEvent = {nick: string, tags: Tags};

type WhoisEvent = { // TODO: have to check what properties are common
    away: string;
    nick: string;
    ident: string;
    hostname: string;
    actual_ip: string;
    actual_hostname: string;
    real_name: string;
    helpop?: string;
    bot?: string;
    server: string;
    server_info?: string;
    operator: 'is an operator';
    channels: 'is on these channels';
    modes: string;
    idle: string;
    logon: string;
    registered_nick?: string;
    account?: string;
    secure?: string;
    special?: string;
};

type WhoWasEvent = {
    nick: string;
    ident: string;
    hostname: string;
    real_name: string;
    actual_ip?: string;
    actual_hostname?: string;
    account?: string;
    server?: string;
    server_info?: string;
    error?: string;
};

type InviteListEvent = {
    channel: string;
    invited: string;
    invited_by: string;
    invited_at: string;
    tags: Tags;
};

type BanListEvent = {
    channel: string;
    bans: string[];
    tags: Tags;
};

type MonitorListEvent = {
    nicks: string[];
};

type WhoListEvent = {
    target: string;
    users: string[];
};

type CtcpResponseEvent = {
    nick: string;
    ident: string;
    hostname: string;
    target: string;
    type: string | null;
    message: string;
    time: number;
    tags: Tags;
};

export type NoticeEvent = {
    from_server: boolean;
    nick: string;
    ident: string;
    hostname: string;
    target: string;
    group: string;
    message: string;
    tags: Tags;
    time: number;
    account: string;
    batch: string; // string or number?
    reply(message: string): void;
};

type ActionEvent = {
    from_server: boolean;
    nick: string;
    ident: string;
    hostname: string;
    target: string;
    group: string;
    message: string;
    tags: Tags;
    time: number;
    account: string;
    batch: string; // string or number?
    reply(message: string): void;
};

type CtcpRequestEvent = {
    from_server: boolean;
    nick: string;
    ident: string;
    hostname: string;
    target: string;
    group: string;
    type: string | null;
    message: string;
    time: number;
    account: string;
    tags: Tags;
};

export type PrivMsgEvent = {
    from_server: boolean;
    nick: string;
    ident: string;
    hostname: string;
    target: string;
    message: string;
    tags: Tags;
    time: number;
    account: string;
    batch: string;
    reply(message: string): void;
};

type TagMsgEvent = {
    from_server: boolean;
    nick: string;
    ident: string;
    hostname: string;
    target: string;
    tags: Tags;
    batch: string;
};

type WallopsEvent = {
    from_server: boolean;
    nick: string;
    ident: string;
    hostname: string;
    message: string;
    account: string;
    tags: Tags;
};

export type DisplayedHostEvent = {
    nick: string;
    hostname: string;
    tags: Tags;
};

export type JoinEvent = {
    nick: string;
    ident: string;
    hostname: string;
    gecos: string;
    channel: string;
    time: number;
    account?: string;
};

export type IrcEvent = RegisteredEvent | WhoisEvent | WhoWasEvent | InviteListEvent | BanListEvent | MonitorListEvent | WhoListEvent | CtcpResponseEvent | NoticeEvent | ActionEvent | CtcpRequestEvent | NoticeEvent | CtcpRequestEvent | PrivMsgEvent | TagMsgEvent | WallopsEvent;

export interface MiddlewareHandler {
    use<T extends unknown[]>(middleware: (...args: [...T, (err?: Error) => void]) => void): void;
}

export type IrcMiddleware = (command: string, event: IrcEvent, client: IrcClient, next: (err: Error) => void) => void;
export type Handler<T extends IrcEvent> = (command: string, event: T) => void;

declare class IrcClient extends EventEmitter {
    constructor(options?: IrcClientOptions);
    options: IrcClientOptions;
    connected: boolean;
    user: User;
    requestCap(cap: string | string[]): void;
    use<T extends IrcClient>(middleware_fn: (client: T, rawEvents: MiddlewareHandler, parsed_events: MiddlewareHandler) => void): this;
    connect(options?: IrcClientOptions): void;
    raw(raw_data_line: string): void;
    rawString(...input: string[]): string;
    quit(message?: string): void;
    ping(message?: string): void;
    changeNick(nick: string): void;
    sendMessage(commandName: string, target: string, message: string, tags: Tags): void;
    say(target: string, message: string, tags?: Tags): void;
    notice(target: string, message: string, tags?: Tags): void;
    tagmsg(target: string, tags: Tags): void;
    join(channel: string, key?: string): void;
    part(channel: string, message?: string): void;
    mode(channel: string, mode: string, ...extra_args: string[]): void;
    inviteList(channel: string, cb?: (event: InviteListEvent | null) => void): void;
    invite(channel: string, nick: string): void;
    addInvite(channel: string, mask: string): void;
    removeInvite(channel: string, mask: string): void;
    banlist(channel: string, cb?: (event: BanListEvent) => void): void;
    ban(channel: string, mask: string): void;
    unban(channel: string, mask: string): void;
    setTopic(channel: string, newTopic?: string): void;
    ctcpRequest(target: string, ...paramN: string[]): void;
    ctcpResponse(target: string, ...paramN: string[]): void;
    action(target: string, message: string): string[];
    whois(nick: string, ...args: string[]): void;
    whois(nick: string, ...args: [...string[], (event: WhoisEvent) => void]): void;
    whowas(target: string, ...args: [...string[], (event: WhoWasEvent) => void]): void;
    who(target: string, cb?: (event: WhoListEvent) => void): void;
    monitorList(cb: (event: MonitorListEvent) => void): void;
    addMonitor(target: string): void;
    removeMonitor(target: string): void;
    queryMonitor(): void;
    clearMonitor(): void;
    list(...args: string[]): void;
    channel(channel_name: string): Channel;
    match(match_regex: RegExp, cb: (event: CtcpResponseEvent) => void, message_type: 'ctcp response'): {stop(): void};
    match(match_regex: RegExp, cb: (event: NoticeEvent) => void, message_type: 'notice'): {stop(): void};
    match(match_regex: RegExp, cb: (event: ActionEvent) => void, message_type: 'action'): {stop(): void};
    match(match_regex: RegExp, cb: (event: CtcpRequestEvent) => void, message_type: 'ctcp request'): {stop(): void};
    match(match_regex: RegExp, cb: (event: PrivMsgEvent) => void, message_type: 'privmsg'): {stop(): void};
    match(match_regex: RegExp, cb: (event: TagMsgEvent) => void, message_type: 'tagmsg'): {stop(): void};
    match(match_regex: RegExp, cb: (event: WallopsEvent) => void, message_type: 'wallops'): {stop(): void};
    matchNotice(match_regex: RegExp, cb: (event: IrcMessage) => void): {stop(): void};
    matchMessage(match_regex: RegExp, cb: (event: IrcMessage) => void): {stop(): void};
    matchAction(match_regex: RegExp, cb: (event: unknown) => void): {stop(): void};
    caseCompare(string1: string, string2: string): boolean;
    caseLower(string: string): string;
    caseUpper(string: string): string;
}

export {IrcClient as Client};
