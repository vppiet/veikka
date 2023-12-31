import Database from 'bun:sqlite';
import {LocationTable} from '../db/location';
import {Service} from '../service';
import {decodeGeoCodingResponse, getGeoCoding} from './externalAPIs/openMeteo';

const LOCATION_SERVICE_ID = Symbol('location');

class LocationService implements Service {
    id: symbol = LOCATION_SERVICE_ID;
    locationTable: LocationTable;

    constructor(db: Database) {
        this.locationTable = new LocationTable(db);
    }

    async getLocation(name: string) {
        const cacheResult = this.getLocationFromCache(name);

        if (cacheResult.value) {
            return {value: cacheResult.value};
        }

        const extResult = await this.getLocationFromExt(name);

        if (extResult.value) {
            this.locationTable.insertOne.run({$name: name, $json: JSON.stringify(extResult.value)});

            const location = extResult.value.results?.at(0);

            if (location) {
                return {value: location};
            } else {
                return {error: `No locations found with name "${name}"`};
            }
        }

        return {error: extResult.error};
    }

    getLocationFromCache(name: string) {
        const cache = this.locationTable.getOne.get({$name: name});

        if (cache) {
            const parseResult = decodeGeoCodingResponse(cache.json);

            if ('error' in parseResult && parseResult.error) {
                return {error: parseResult.error};
            }

            if (parseResult.value?.results?.length) {
                return {value: parseResult.value.results[0]};
            }
        }

        return {error: 'Location not in cache'};
    }

    async getLocationFromExt(name: string) {
        return await getGeoCoding(name);
    }
}

export {LOCATION_SERVICE_ID, LocationService};
