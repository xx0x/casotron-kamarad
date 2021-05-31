import { WaveFile } from 'wavefile';
import wavHeaders from 'wav-headers';
import Samples from './Samples';

function getSamplesFromNumber(n) {
    if (n < 21) {
        return [n];
    }
    const result = [Math.floor(n / 10) * 10];
    if (n % 10 !== 0) {
        result.push(n % 10);
    }
    return result;
}

export default function sayRandomTime(samplesData) {

    return new Promise((resolve) => {
        const hh = Math.floor(Math.random() * 24);
        const mm = Math.floor(Math.random() * 60);

        let hoursSample = Samples.Hours;
        let minutesSample = Samples.Minutes;

        if (hh % 10 === 1 && hh !== 11) {
            hoursSample = Samples.Hours1;
        } else if ((hh % 10 === 2 && hh !== 12) || (hh % 10 === 3 && hh !== 13) || (hh % 10 === 4 && hh !== 14)) {
            hoursSample = Samples.Hours24;
        }

        if (mm % 10 === 1 && mm !== 11) {
            minutesSample = Samples.Minutes1;
        } else if ((mm % 10 === 2 && mm !== 12) || (mm % 10 === 3 && mm !== 13) || (mm % 10 === 4 && mm !== 14)) {
            minutesSample = Samples.Minutes24;
        }

        const batch = [Samples.Intro, ...getSamplesFromNumber(hh), hoursSample, ...getSamplesFromNumber(mm), minutesSample, Samples.Outro];
        const rawDataArrays = batch.map((id) => {
            const wavFile = new WaveFile(samplesData[id]);
            if (wavFile) {
                return wavFile.data.samples;
            }
            return new Uint8Array([]);
        });
        const length = rawDataArrays.map((x) => x.length).reduce((a, b) => a + b);
        const rawData = new Uint8Array(length);
        let prevAddrs = 0;
        rawDataArrays.forEach((rda) => {
            rawData.set(rda, prevAddrs);
            prevAddrs += rda.length;
        });

        const headersBuffer = wavHeaders({
            channels: 1,
            sampleRate: 22050,
            bitDepth: 16,
            dataLength: length
        });
        const fullBuffer = Buffer.concat([headersBuffer, rawData]);
        const ao = new Audio(URL.createObjectURL(new Blob([fullBuffer])));
        ao.onended = resolve;
        ao.play();
    });
}