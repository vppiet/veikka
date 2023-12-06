declare module 'middleware-handler' {
    export default class MiddlewareHandler {
        use<T extends unknown[]>(middleware: (...args: [...T, (err?: Error) => void]) => void): void;
        clear(): void;
        handle<T extends unknown[]>(...args: [...T, (this: null, ...args: T) => void]): void;
        compose(callback: (err?: Error) => void): (...args: unknown[]) => void;
    }

    export function compose<T extends unknown[]>(...middlewares: T): (callback: (err?: Error) => void) => void;
}
