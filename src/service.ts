import {Closeable, Initialisable} from "./util";

interface Service extends Initialisable, Closeable {
    id: string,
}

export {Service};
