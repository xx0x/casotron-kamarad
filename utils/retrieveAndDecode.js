import log from 'loglevel';
import customAudioBufferToWav from './customAudioBufferToWav';

export default function retrieveAndDecode(filename) {
    return new Promise((resolve, reject) => {
        const audioContext = new window.AudioContext();
        const request = new XMLHttpRequest();
        request.open('GET', filename, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {
            audioContext.decodeAudioData(request.response).then((decodedAudio) => {
                const wavData = customAudioBufferToWav(decodedAudio, { monoMix: true });
                log.debug('🔊 WAV conversion complete.');
                resolve(new Uint8Array(wavData));
            }).catch((e) => {
                reject();
                log.debug('Error with decoding audio data', e);
            });
        };
        request.send();
    });
}