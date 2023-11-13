import {IrcEventListener} from './listener';
import {Closeable, Context, isType} from './util';
import {JoinEvent, RegisteredEvent} from 'irc-framework';
import NETWORKS from './networks';
import {Command} from 'command';

class JoinListener implements IrcEventListener {
    getEventName(): string {
        return 'join';
    }

    listener(this: Context<JoinListener>, event: JoinEvent): void {
        if (event.nick !== this.client.user.nick) return;
        this.client.channels.push(this.client.channel(event.channel));
    }
}

class SocketCloseListener implements IrcEventListener {
    getEventName(): string {
        return 'socket close';
    }

    listener(this: Context<SocketCloseListener>): void {
        this.client.publishers.forEach((p) => p.stopTimer());
        this.client.db.close();
        this.client.commands
            .filter((c): c is Command & Closeable => isType<Closeable, Command>(c, ['close']))
            .forEach((c) => c.close(this.client));
    }
}

class RegisteredListener implements IrcEventListener {
    getEventName(): string {
        return 'registered';
    }

    listener(this: Context<RegisteredListener>, event: RegisteredEvent): void {
        const domain = this.client.options.host?.split('.').slice(-2).join('.');
        if (domain && NETWORKS[domain]) {
            NETWORKS[domain].handler(this.client);
        } else {
            this.client.emit('network services');
        }
    }
}

class NetworkServicesListener implements IrcEventListener {
    getEventName(): string {
        return 'network services';
    }

    listener(this: Context<NetworkServicesListener>): void {
        Bun.env['SERVER_AUTOJOIN']?.split(', ').forEach((c) => this.client.join(c));
        this.client.removeListener('network services', this.listener.listener);
    }
}

export default [
    JoinListener,
    SocketCloseListener,
    RegisteredListener,
    NetworkServicesListener,
];
