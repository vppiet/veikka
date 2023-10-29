import {Veikka} from './lib/veikka';
import {LogMiddleware} from './lib/plugins/logPlugin';
import {HelpCommand} from './lib/commands/helpCommand';
import {QuitCommand} from './lib/commands/quitCommand';
import {JoinCommand} from './lib/commands/joinCommand';
import {ReminderCommand} from './lib/commands/reminderCommand';

const veikka = await Veikka.create();

veikka.use(new LogMiddleware().middleware());
veikka.addCommand(new HelpCommand())
    .addCommand(new QuitCommand())
    .addCommand(new JoinCommand())
    .addCommand(new ReminderCommand());

veikka.connect({
    nick: Bun.env['NICK'],
    username: Bun.env['USERNAME'],
    gecos: Bun.env['GECOS'],
    host: Bun.env['SERVER_HOST'],
    port: Number(Bun.env['SERVER_PORT']) || 6667,
});
