import {Veikka} from './lib/veikka';
import {LogMiddleware} from './lib/plugins/logPlugin';
import {QuitCommand} from './lib/commands/quitCommand';
import {QuakeNetRegister} from './lib/plugins/quakeNetPlugin';

const veikka = new Veikka();

// NETWORK
const qnet = new QuakeNetRegister();
qnet.addAutoJoin('#botlab');
veikka.addListener(qnet.getEventName(), qnet.listener, {client: veikka, listener: qnet});

// PLUGINS
veikka.use(new LogMiddleware().middleware());
veikka.addCommand(new QuitCommand('.', 'quit'));

// CONNECTION
veikka.connect({
    nick: 'Veikka',
    username: 'Veikka',
    gecos: 'Veikka',
    host: 'stockholm.se.quakenet.org',
    port: 6667,
});

// LOCAL
// veikka.addAutojoin('#botlab');
// veikka.addRequiredCompletionListener(new QuakeNetRegister());
// veikka.addCommand(new QuitCommand('.', 'quit'));
// veikka.connect({nick: 'veikka', username: 'veikka', host: 'puskavattu.home', port: 6667});
