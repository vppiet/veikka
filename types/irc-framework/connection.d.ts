import {EventEmitter} from 'eventemitter3';

export interface RegistrationEvent {nick: string;}
export type ReconnectionEvent = Record<string, never>;

export default class Connection extends EventEmitter {}
