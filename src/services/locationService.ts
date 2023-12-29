import {Service} from '../service';
import {Location, getGeoCoding} from './externalAPIs/openMeteo';

const LOCATION_SERVICE_ID = Symbol('location');

class LocationService implements Service {
    id: symbol = LOCATION_SERVICE_ID;

    async getLocation(name: string): Promise<{value: Location} | {error: string}> {
        const r = await getGeoCoding(name);

        if ('error' in r) {
            return {error: `Sisäinen virhe :< (${r.error})`};
        }

        if (!r.value.results.length) {
            return {error: 'Paikkaa ei löydetty'};
        }

        // assume the first location is the best match
        return {value: r.value.results[0]};
    }
}

export {LOCATION_SERVICE_ID, LocationService};
