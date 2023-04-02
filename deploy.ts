import {Veikka} from './lib/veikka.js';
import {registrationMiddleware}
    from './lib/middlewares/registrationMiddleware.js';
import {greetingMiddleware}
    from './lib/middlewares/greetingMiddleware.js';
import {loggingMiddleware}
    from './lib/middlewares/loggingMiddleware.js';

const veikka = new Veikka();
const client = veikka.getClient();

client.use(loggingMiddleware());
client.use(registrationMiddleware());
client.use(greetingMiddleware());

veikka.connect({host: 'localhost', port: 6667});
