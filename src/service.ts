import {Closeable, Initialisable} from "./util";

interface Service extends Initialisable, Closeable {
    id: symbol;
}

export {Service};
