import {EventEmitter} from 'eventemitter3';
import {IrcClientOptions} from './client';

export interface RegistrationEvent {nick: string;}
export type ReconnectionEvent = Record<string, never>;
export type ConnectionOptions = IrcClientOptions & {
    host: string;
    port: number;
};

export default class Connection extends EventEmitter {}
