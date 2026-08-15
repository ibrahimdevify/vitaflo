/**
 * floatJson.js
 *
 * JavaScript/JSON has no distinction between "80" and "80.0" — both are just
 * the Number 80, and JSON.stringify always drops trailing zeros. Dart's
 * `double` fields will throw a type error if they receive a bare JSON
 * integer (e.g. `weight = json['weight']` where json['weight'] is `80`
 * not `80.0`).
 *
 * This module lets you mark specific values as "must serialize with a
 * decimal point" without touching JSON.stringify's core behavior globally
 * (which would be risky/expensive) or hand-rolling JSON serialization for
 * the whole payload.
 *
 * How it works:
 *   1. Wrap the value with `asFloat(value)`. It returns an object whose
 *      `toJSON()` produces a unique sentinel string instead of a number.
 *   2. Run the whole payload through `stringifyWithFloats(obj)`. This
 *      calls JSON.stringify normally (so nesting, arrays, null, etc. all
 *      work exactly as before), then does one regex pass to swap each
 *      quoted sentinel for a raw, unquoted decimal literal.
 *
 * Use this for ANY numeric field a Dart/Flutter client expects as
 * `double`/`double?`, in any controller — not just this one.
 */

const SENTINEL_PREFIX = '@@FLOAT:';
const SENTINEL_SUFFIX = '@@';
// Matches the quoted sentinel exactly as JSON.stringify will emit it.
const SENTINEL_REGEX = /"@@FLOAT:(-?\d+(?:\.\d+)?)@@"/g;

class FloatValue {
    constructor(numericString) {
        this._numericString = numericString;
    }

    toJSON() {
        return `${SENTINEL_PREFIX}${this._numericString}${SENTINEL_SUFFIX}`;
    }
}

/**
 * Wrap a value so it always serializes as a JSON float (with a decimal
 * point), regardless of whether it's a whole number.
 *
 * @param {number|string|null|undefined} value
 * @param {number} decimals - number of decimal places to fix to (default 1,
 *   matching the existing .toFixed(1) behavior in patientController.js)
 * @returns {FloatValue|null}
 */
function asFloat(value, decimals = 1) {
    if (value === null || value === undefined || value === '') return null;

    const num = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(num)) return null;

    let str = num.toFixed(decimals);

    // toFixed(0) or a decimals value that strips the point entirely would
    // break the "always has a decimal point" guarantee — enforce it here.
    if (!str.includes('.')) str += '.0';

    return new FloatValue(str);
}

/**
 * JSON.stringify a payload that may contain FloatValue instances (from
 * asFloat), producing a JSON string where those fields are guaranteed to
 * include a decimal point (e.g. 80.0 instead of 80).
 *
 * @param {*} obj
 * @param {number|string} [space] - optional pretty-print indent, forwarded
 *   to JSON.stringify
 * @returns {string}
 */
function stringifyWithFloats(obj, space) {
    const json = JSON.stringify(obj, null, space);
    return json.replace(SENTINEL_REGEX, '$1');
}

module.exports = { asFloat, stringifyWithFloats, FloatValue };