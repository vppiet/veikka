import {Body, Illumination, MoonPhase} from "astronomy-engine";
import round from "lodash.round";

function getMoonIlluminationPercentage(date: Date) {
    const {phase_fraction} = Illumination(Body.Moon, date);
    return round(phase_fraction * 100, 1);
}

const MOON_PHASES: Readonly<{angle: number, description: string}[]> = [
    {angle: 0, description: 'Uusi kuu'},
    {angle: 45, description: 'Kasvava sirppi'},
    {angle: 90, description: 'Ensimmäinen neljännes'},
    {angle: 135, description: 'Kasvava kupera kuu'},
    {angle: 180, description: 'Täysikuu'},
    {angle: 225, description: 'Vähenevä kupera kuu'},
    {angle: 270, description: 'Viimeinen neljännes'},
    {angle: 315, description: 'Vähenevä sirppi'},
];

function getMoonPhaseString(date: Date) {
    const currentPhase = MoonPhase(date);

    const mp = MOON_PHASES.find((mp, i) => {
        if (i === MOON_PHASES.length - 1 && currentPhase >= MOON_PHASES[i].angle) {
            return true;
        } else if (currentPhase >= mp.angle && currentPhase < MOON_PHASES[i + 1].angle) {
            return true;
        }

        return false;
    });

    return mp?.description ?? 'Error determining moon phase';
}

export {getMoonIlluminationPercentage, getMoonPhaseString};
