import log from 'loglevel';
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
                log.debug('🔊 WAV conversion complete.');
                resolve(new Uint8Array(wavData));
            }).catch((e) => {
                reject();
                log.debug('Error with decoding audio data', e);
            });
        };
        rdr.readAsArrayBuffer(file);
    });
}