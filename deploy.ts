import {CalculateCommand} from './src/commands/calculateCommand';
import {DebugCommand} from './src/commands/debugCommand';
import {HelpCommand} from './src/commands/helpCommand';
import {JoinCommand} from './src/commands/joinCommand';
import {MessageCommand} from './src/commands/messageCommand';
import {MoonCommand} from './src/commands/moonCommand';
import {PoemMetreCommand} from './src/commands/poemMetreCommand';
import {QuitCommand} from './src/commands/quitCommand';
import {ReminderCommand} from './src/commands/reminderCommand';
import {CurrentWeatherCommand} from './src/commands/weatherCommand';
import {LogMiddleware} from './src/middlewares/logMiddleware';
import {LocationService} from './src/services/locationService';
import {Veikka} from './src/veikka';

const veikka = Veikka.create();
const db = veikka.db;

veikka.use(new LogMiddleware().middleware());

veikka.addService(new LocationService());

veikka
    .addCommand(new HelpCommand())
    .addCommand(new QuitCommand())
    .addCommand(new JoinCommand())
    .addCommand(new ReminderCommand(db))
    .addCommand(new CurrentWeatherCommand())
    .addCommand(new CalculateCommand())
    .addCommand(new PoemMetreCommand(db))
    .addCommand(new MoonCommand())
    .addCommand(new DebugCommand())
    .addCommand(new MessageCommand());

veikka.connect({
    nick: Bun.env.NICK,
    username: Bun.env.USERNAME,
    gecos: Bun.env.GECOS,
    host: Bun.env.SERVER_HOST,
    port: Number(Bun.env.SERVER_PORT) || 6667,
});
