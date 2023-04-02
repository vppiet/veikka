const DEFAULT_ENVIRONMENT: Record<string, string> = {
    VEIKKA_LOG_LEVEL: 'info',
};

function setDefaultEnvironment(): void {
    for (const [name, value] of Object.entries(DEFAULT_ENVIRONMENT)) {
        if (!process.env[name]) {
            process.env[name] = value;
        }
    }

    return;
}

export {setDefaultEnvironment};
