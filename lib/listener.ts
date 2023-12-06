type EventListener = {
    eventName: string;
    listener(...args: unknown[]): void;
};

export {EventListener};
