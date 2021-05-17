import { useState } from "react";
import { WaveFile } from "wavefile";
import customAudioBufferToWav from "../utils/customAudioBufferToWav";


export default function SoundItem({ id, filename }) {

    const [audioSrc, setAudioSrc] = useState(null);

    return (
        <div key={id}>
            <h3>{id}</h3>
            <audio
                src={audioSrc}
                controls
            />

            <button onClick={() => {
                const audioContext = new window.AudioContext();
                const request = new XMLHttpRequest();
                request.open('GET', filename, true);
                request.responseType = 'arraybuffer';
                request.onload = function () {
                    audioContext.decodeAudioData(request.response).then((decodedAudio) => {
                        console.log(decodedAudio);
                        const wavData = customAudioBufferToWav(decodedAudio, { monoMix: true });
                        console.log(wavData);
                        // setAudioSrc(URL.createObjectURL(new Blob([wavData])));
                        const wavFile = new WaveFile(new Uint8Array(wavData));
                        wavFile.toBitDepth(16);
                        wavFile.toSampleRate(22050);
                        console.log(wavFile);

                        const convertedWavData = wavFile.toBuffer();
                        //                         console.log(convertedWavData);
                        setAudioSrc(URL.createObjectURL(new Blob([convertedWavData])));
                    }).catch((e) => {
                        console.log("Error with decoding audio data", e);
                    });

                }
                request.send();

            }}>
                Load default
            </button>
        </div >
    )
}