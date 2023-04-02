declare module 'middleware-handler' {
    export default class MiddlewareHandler {
        use(middleware: (...args: any[]) => void): void;
        clear(): void;
        handle(args: any[], callback: (this: null, args: any[]) => void): void;
        compose(callback: () => void): () => void;
    }
}
