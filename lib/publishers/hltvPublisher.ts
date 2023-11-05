import {JoinEvent} from 'irc-framework';
import Parser from 'rss-parser';

import {Publisher} from '../publisher';
import {Context, INTERVAL} from '../util';
import {Veikka} from 'veikka';

class HltvPublisher implements Publisher {
    subscriptions: string[] = [];
    timer?: Timer;

    cache?: Parser.Output<Record<string, unknown>>;
    parser: Parser = new Parser();

    addSubscription(channel: string) {
        this.subscriptions.push(channel);

        return this;
    }

    getEventName() {
        return 'join';
    }

    listener(this: Context<HltvPublisher>, event: JoinEvent) {
        if (event.nick !== this.client.user.nick ||
            !this.listener.subscriptions.includes(event.channel)) return;

        // start working when first subscribed channel is joined
        this.listener.startTimer(this.client);
        this.client.removeListener(this.listener.getEventName(), this.listener.listener);
    }

    async startTimer(client: Veikka) {
        this.cache = await this.getFeed();

        if (!this.cache || this.cache.items.length === 0) {
            throw new Error('Unable to fetch URL');
        }

        const handler = async () => {
            const feed = await this.getFeed();
            const i = feed.items.findIndex((i) => {
                if (!this.cache) return true;
                return i.guid === this.cache.items[0].guid;
            });

            if (i === -1) {
                this.publish(client, feed.items[0]);
            } else {
                const newItems = feed.items.slice(0, i);
                newItems.forEach((ni) => this.publish(client, ni));
            }

            this.cache = feed;
        };

        this.timer = setInterval(handler, INTERVAL.HOUR, this);
    }

    publish(client: Veikka, item: Parser.Item) {
        this.subscriptions.forEach((s) => {
            client.say(s, `HLTV | ${item.title || 'No title'} | ${item.link || 'No link'}`);
        });
    }

    stopTimer() {
        clearInterval(this.timer);
    }

    async getFeed() {
        return this.parser.parseURL('https://www.hltv.org/rss/news');
    }
}

export {HltvPublisher};
