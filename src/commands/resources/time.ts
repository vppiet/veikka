const DATETIME_FORMAT = 'd.M.yyyy H:mm';

const INTERVAL: Readonly<Record<string, number>> = {
    MINUTE: 1000 * 60,
    HOUR: 1000 * 60 * 60,
};

export {DATETIME_FORMAT, INTERVAL};
