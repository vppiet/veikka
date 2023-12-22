import Database from "bun:sqlite";
import {Service} from "../service";

const LOCATION_SERVICE_ID = Symbol('location');

class LocationService implements Service {
    id: symbol = LOCATION_SERVICE_ID;
    conn: Database; // TODO: location table

    constructor(conn: Database) {
        this.conn = conn;
    }

    initialise(): void {
        throw new Error("Method not implemented.");
    }

    close(): void {
        throw new Error("Method not implemented.");
    }
}

export {LOCATION_SERVICE_ID, LocationService};
