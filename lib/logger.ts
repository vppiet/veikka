import {createLogger, format, transports} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const level = process.env['VEIKKA_LOG_LEVEL'] ?
    process.env['VEIKKA_LOG_LEVEL']: 'info';

const console = new transports.Console();
const file = new DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
});

const rootLogger = createLogger({
    format: format.combine(
        format.splat(),
        format.timestamp(),
        format.json(),
    ),
    level: level,
    transports: [console, file],
});

function getLogger(name: string) {
    return rootLogger.child({module: name});
}

export {getLogger};
