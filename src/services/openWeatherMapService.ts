import {Service} from "../service";
import {Veikka} from "../veikka";

class OpenWeatherMapService implements Service {
    id = 'OPENWEATHERMAP';
    initialise(client: Veikka): void {
        throw new Error("Method not implemented.");
    }
    close(client: Veikka): void {
        throw new Error("Method not implemented.");
    }
}

export {OpenWeatherMapService};
