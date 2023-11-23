import {Veikka} from './lib/veikka';
import {LogMiddleware} from './lib/middlewares/logMiddleware';
import {HelpCommand} from './lib/commands/helpCommand';
import {QuitCommand} from './lib/commands/quitCommand';
import {JoinCommand} from './lib/commands/joinCommand';
import {ReminderCommand} from './lib/commands/reminderCommand';
import {CurrentWeatherCommand} from './lib/commands/weatherCommand';
import {CalculateCommand} from './lib/commands/calculateCommand';
import {PoemMetreCommand} from './lib/commands/poemMetreCommand';
import {AstroCommand} from './lib/commands/astroCommand';
import {DebugCommand} from './lib/commands/debugCommand';

const veikka = await Veikka.create();
const db = veikka.db;

veikka.use(new LogMiddleware().middleware());
veikka.addCommand(new HelpCommand())
    .addCommand(new QuitCommand())
    .addCommand(new JoinCommand())
    .addCommand(new ReminderCommand(db))
    .addCommand(new CurrentWeatherCommand())
    .addCommand(new CalculateCommand())
    .addCommand(new PoemMetreCommand(db))
    .addCommand(new AstroCommand())
    .addCommand(new DebugCommand());

veikka.connect({
    nick: Bun.env['NICK'],
    username: Bun.env['USERNAME'],
    gecos: Bun.env['GECOS'],
    host: Bun.env['SERVER_HOST'],
    port: Number(Bun.env['SERVER_PORT']) || 6667,
    auto_reconnect_max_retries: 10,
});
