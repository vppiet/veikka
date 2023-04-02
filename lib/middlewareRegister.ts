import {IrcMiddleware} from 'irc-framework';

interface Container<T> {
    [name: string]: T,
}

class MiddlewareRegister {
    protected middlewares: Container<IrcMiddleware>;

    constructor() {
        this.middlewares = {};
    }

    add(name: string, middleware: IrcMiddleware): void {
        this.middlewares[name] = middleware;
    }

    get(name: string): IrcMiddleware | undefined {
        return this.middlewares?.name;
    }

    getAll() {
        return this.middlewares;
    }
}

export {MiddlewareRegister};
