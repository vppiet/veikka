import {createLogger, format, transports} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const LEVEL = Bun.env['LOG_LEVEL'] ?? 'info';

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
    level: LEVEL,
    transports: [console, file],
});

function getLogger(name: string, path?: string) {
    return rootLogger.child({module: name, path: path});
}

export {getLogger};
