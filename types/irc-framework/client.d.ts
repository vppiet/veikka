import {EventEmitter} from 'eventemitter3';
import MiddlewareHandler from 'middleware-handler';
import {IrcCommandHandler} from './commands/';
import IrcMessage from './ircmessage';
import Connection from './connection';
import NetworkInfo from './networkinfo';
import User from './user';
import Channel from './channel';
import {lineBreak} from './linebreak';
import * as MessageTags from './messagetags';

type Tags = unknown;

interface IrcClientOptions {
    nick?: string;
    username?: string;
    gecos?: string;
    encoding?: string;
    version?: string;
    enable_chghost?: boolean;
    enable_setname?: boolean;
    enable_echomessage?: boolean;
    auto_reconnect?: boolean;
    auto_reconnect_max_wait?: number;
    auto_reconnect_max_retries?: number;
    ping_interval?: number;
    ping_timeout?: number;
    message_max_length?: 350;
    sasl_disconnect_on_fail?: boolean;
    transport?: unknown;
    websocket_protocol?: string;
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

type Middleware = (client: IrcClient, ) => void; // !!!

export default class IrcClient extends EventEmitter {
    constructor(options?: IrcClientOptions);
    request_extra_caps: Array<string>;
    options: IrcClientOptions | null;
    static setDefaultTransport(transport: unknown): void; // transport?
    get Message(): IrcMessage;
    _applyDefaultOptions(user_options: IrcClientOptions): IrcClientOptions;
    createStructure(): void;
    raw_middleware: MiddlewareHandler;
    parsed_middleware: MiddlewareHandler;
    connection: Connection;
    network: NetworkInfo;
    user: User;
    command_handler: IrcCommandHandler;
    connected: boolean;
    requestCap(cap: string | Array<string>): void;
    use(middleware_fn: Middleware): this;
    connect(options?: IrcClientOptions): void;
    proxyIrcEvents(): void;
    addCommandHandlerListeners(): void;
    registerToNetwork(): void;
    startPeriodicPing(): void;
    resetPingTimeoutTimer(): void;
    debugOut(out: string): void;
    raw(input: IrcMessage, ...args: Array<string | number>): void;
    rawString(...args: Array<string | number>): string;
    quit(quit_message?: string): void;
    ping(message?: string): void;
    changeNick(nick: string): void;
    sendMessage(commandName: string, target: string, message: string, tags: Tags): void;
    say(target: string, message: string, tags?: Tags): void;
    notice(target: string, message: string, tags?: Tags): void;
    tagmsg(target: string, tags?: Tags): void;
    join(channel: string, key?: string): void;
    part(channel: string, message?: string): void;
    mode(channel: string, mode: string, extra_args: Array<string> | string): void; // mode?
    setTopic(channel: string, newTopic: string): void;
    ctcpRequest(target: string, type: string, ...paramN: string[]): void;
    ctcpResponse(target: string, type: string, ...paramN: string[]): void;
    action(target: string, message: string): Array<string>;
    whois(nick: string, cb: (event: any) => void): void; // event?
}
