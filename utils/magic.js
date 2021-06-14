/* eslint-disable no-bitwise */
/* eslint-disable no-restricted-properties */

/**
 * Magic je zde.
 * Nekopirujte zvuky pls, je to na vyslovne prani pana Knopa, diky...
 */

function singleMagic(v, digits = 8) {
    return ~v & (Math.pow(2, digits) - 1);
}

export default function magic(src) {
    return src.map((v) => singleMagic(v));
}
