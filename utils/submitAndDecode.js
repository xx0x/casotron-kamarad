import log from 'loglevel';
import { WaveFile } from 'wavefile';
import customAudioBufferToWav from './customAudioBufferToWav';

export default function submitAndDecode(file) {
    const audioContext = new window.AudioContext();
    return new Promise((resolve, reject) => {
        // Reader will go here
        const rdr = new FileReader();
        rdr.onload = (ev) => {
            // Decode audio
            audioContext.decodeAudioData(ev.target.result).then((decodedAudio) => {
                const wavData = customAudioBufferToWav(decodedAudio, { monoMix: true });
                log.debug('🔊 WAV conversion start.');
                const wavFile = new WaveFile(new Uint8Array(wavData));
                if (wavFile) {
                    wavFile.toBitDepth(16);
                    wavFile.toSampleRate(22050);
                    log.debug('🔊 WAV conversion complete.');
                    const convertedWavData = wavFile.toBuffer();
                    resolve(new Blob([convertedWavData]));
                }
            }).catch((e) => {
                reject();
                log.debug('Error with decoding audio data', e);
            });
        };
        rdr.readAsArrayBuffer(file);
    });
}