const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const JULIAN_DAYS_BEFORE_UNIX_TIME = 2440587.5;

// eslint-disable-next-line max-len
// https://stackoverflow.com/questions/11759992/calculating-jdayjulian-day-in-javascript/11760121#11760121
// eslint-disable-next-line max-len
// https://astronomy.stackexchange.com/questions/51505/calculate-moon-illumination-given-moon-age/53324#53324

function getJulianCenturiesSinceJ2000(jd: number) {
    return (jd - 2451545) / 36525;
}

function getJulianDateFromDate(date: Date) {
    return (date.getTime() / DAY_IN_MILLISECONDS) + JULIAN_DAYS_BEFORE_UNIX_TIME;
}

function toRadians(degrees: number) {
    return degrees * Math.PI / 180;
}

function toDegrees(radiants: number) {
    return radiants * 180 / Math.PI;
}

function constrain(degrees: number) {
    const remainder = degrees % 360;
    return remainder < 0 ? remainder + 360 : remainder;
}

function getMoonIllumination(date: Date) {
    const jd = getJulianDateFromDate(date);
    const T = getJulianCenturiesSinceJ2000(jd);

    const D = toRadians(constrain(297.850191 + 445267.1114034 * T - 0.0018819 * Math.pow(T, 2) +
        (1 / 545868) * Math.pow(T, 3) - (1 / 113065000) * Math.pow(T, 4)));
    const M = toRadians(constrain(357.5291092 + 35999.0502909 * T - 0.0001536 * Math.pow(T, 2) +
        (1 / 24490000) * Math.pow(T, 3)));
    const Md = toRadians(constrain(134.9633964 + 477198.8675055 * T + 0.0087414 * Math.pow(T, 2) +
        (1 / 69699) * Math.pow(T, 3) - (1 / 14712000) * Math.pow(T, 4)));

    const i = toRadians(constrain(180 - toDegrees(D) - 6.289 * Math.sin(Md) + 2.1 * Math.sin(M) -
        1.274 * Math.sin(2 * D - Md) - 0.658 * Math.sin(2 * D) - 0.214 * Math.sin(2 * Md) -
        0.11 * Math.sin(D)));
    const k = (1 + Math.cos(i)) / 2;

    return k;
}

export {
    getJulianDateFromDate,
    getMoonIllumination,
};
