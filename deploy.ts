import {Veikka} from './lib/veikka';
import {LogMiddleware} from './lib/plugins/logPlugin';
import {QuitCommand} from './lib/commands/quitCommand';
import {JoinCommand} from './lib/commands/joinCommand';
import {QuakeNetRegister} from './lib/plugins/quakeNetPlugin';

import {HltvPublisher} from './lib/publishers/hltvPublisher';

const veikka = new Veikka();

// NETWORK
// const qnet = new QuakeNetRegister();
// qnet.addAutoJoin('#botlab');
// veikka.addListener(qnet.getEventName(), qnet.listener, {client: veikka, listener: qnet});

// PLUGINS
veikka.use(new LogMiddleware().middleware());
veikka
    .addCommand(new QuitCommand())
    .addCommand(new JoinCommand())
    .addPublisher(new HltvPublisher().addSubscription('#botlab'));
// .addPublisher(new YlePublisher().addSubscription('#botlab'));

// CONNECTION
veikka.connect({
    nick: 'Veikka',
    username: 'Veikka',
    gecos: 'Veikka Bot (admin: SluvE)',
    // host: 'stockholm.se.quakenet.org',
    host: 'puskavattu.home',
    port: 6667,
});
