import log from 'loglevel';
import { useState } from 'react';
import { WaveFile } from 'wavefile';
import customAudioBufferToWav from '../utils/customAudioBufferToWav';
import style from './SoundItem.module.scss';

export default function SoundItem({
    id, title, transcription, soundSets
}) {

    const [audioSrc, setAudioSrc] = useState(null);

    const soundSet = soundSets[0];

    console.log(soundSet);

    const defaultSound = soundSet.required.find((x) => x.id === id);

    return (
        <div key={id} className={style.container}>
            <h3>{title}</h3>
            <p><em>{transcription}</em></p>

            <audio
                src={audioSrc}
                controls
            />

            {defaultSound &&
                <button
                    type="button"
                    onClick={() => {
                        const audioContext = new window.AudioContext();
                        const request = new XMLHttpRequest();
                        request.open('GET', defaultSound.filename, true);
                        request.responseType = 'arraybuffer';
                        request.onload = () => {
                            audioContext.decodeAudioData(request.response).then((decodedAudio) => {
                                log.debug(decodedAudio);
                                const wavData = customAudioBufferToWav(decodedAudio, { monoMix: true });
                                log.debug(wavData);
                                // setAudioSrc(URL.createObjectURL(new Blob([wavData])));
                                const wavFile = new WaveFile(new Uint8Array(wavData));
                                wavFile.toBitDepth(16);
                                wavFile.toSampleRate(22050);
                                log.debug(wavFile);

                                const convertedWavData = wavFile.toBuffer();
                                // console.log(convertedWavData);
                                setAudioSrc(URL.createObjectURL(new Blob([convertedWavData])));
                            }).catch((e) => {
                                log.debug('Error with decoding audio data', e);
                            });

                        };
                        request.send();

                    }}
                >
                    Load default
                </button>
            }
        </div>
    );
}