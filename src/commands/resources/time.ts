const DATETIME_FORMAT = 'd.M.yyyy H:mm';
const TIME_24H_FORMAT = 'H:mm';

const INTERVAL: Readonly<Record<string, number>> = {
    MINUTE: 1000 * 60,
    HOUR: 1000 * 60 * 60,
};

export {DATETIME_FORMAT, INTERVAL, TIME_24H_FORMAT};
