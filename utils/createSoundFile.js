/* eslint-disable no-bitwise */
function toBytesInt32(num) {
    const arr = new Uint8Array([
        (num & 0xff000000) >> 24,
        (num & 0x00ff0000) >> 16,
        (num & 0x0000ff00) >> 8,
        (num & 0x000000ff)
    ]);
    return arr;
}

export default function createSoundFile(samples) {

    // header length = itself + samples * (sample ID + 32bit number)
    const headerLength = 1 + Object.keys(samples).length * 5;
    const dataLength = Object.values(samples).reduce((sum, sample) => sum + sample.length, 0);
    const totalLength = headerLength + dataLength;

    const buffer = new Uint8Array(new ArrayBuffer(totalLength));

    let i = 0;
    buffer.set([headerLength], i);
    i += 1;

    // write sample ID + its length
    Object.entries(samples).forEach(([id, data]) => {
        buffer.set([id, ...toBytesInt32(data.length)], i);
        i += 5;
    });

    // write actual data
    Object.values(samples).forEach((data) => {
        buffer.set(data, i);
        i += data.length;
    });

    return buffer;
}