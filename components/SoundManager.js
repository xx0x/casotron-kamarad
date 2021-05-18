import log from 'loglevel';
import React from 'react';
import { WaveFile } from 'wavefile';
import createSoundFile from '../utils/createSoundFile';
import customAudioBufferToWav from '../utils/customAudioBufferToWav';
import SoundItem from './SoundItem';
import style from './SoundManager.module.scss';

class SoundManager extends React.Component {

    constructor() {
        super();
        this.state = {
            requiredSoundsData: {}
        };
        this.updateRequiredSound = this.updateRequiredSound.bind(this);
        this.uploadSounds = this.uploadSounds.bind(this);
        this.loadDefaultSound = this.loadDefaultSound.bind(this);
        this.loadAllDefaultSounds = this.loadAllDefaultSounds.bind(this);
    }

    updateRequiredSound(id, data) {
        return new Promise((resolve) => {
            this.setState((prevState) => ({
                requiredSoundsData: {
                    ...(prevState.requiredSoundsData || {}),
                    [id]: data
                }
            }), resolve);
        });
    }

    uploadSounds() {
        const rawData = {};
        Object.entries(this.state.requiredSoundsData).forEach(([id, wavData]) => {
            const wavFile = new WaveFile(wavData);
            if (wavFile) {
                wavFile.toBitDepth(16);
                wavFile.toSampleRate(22050);
                rawData[id] = wavFile.data.samples;
            }
        });
        log.warn(createSoundFile(rawData));
    }

    loadDefaultSound(id) {
        return new Promise((resolve, reject) => {
            const soundSet = this.props.availableSoundSets[0];
            if (soundSet) {
                const defaultSound = soundSet.required.find((x) => x.id === id);
                if (defaultSound) {
                    const audioContext = new window.AudioContext();
                    const request = new XMLHttpRequest();
                    request.open('GET', defaultSound.filename, true);
                    request.responseType = 'arraybuffer';
                    request.onload = () => {
                        audioContext.decodeAudioData(request.response).then((decodedAudio) => {
                            const wavData = customAudioBufferToWav(decodedAudio, { monoMix: true });
                            log.debug('🔊 WAV conversion complete.');
                            this.updateRequiredSound(id, new Uint8Array(wavData)).then(resolve);
                        }).catch((e) => {
                            reject();
                            log.debug('Error with decoding audio data', e);
                        });
                    };
                    request.send();
                }
            }
        });
    }

    loadAllDefaultSounds() {
        const idsToLoad = this.props.soundsDefinition.required.map((item) => (item.id));
        idsToLoad.reduce((p, id) => p.then(() => this.loadDefaultSound(id)), Promise.resolve()); // initial promise
    }

    render() {
        return (
            <div className={style.container}>
                <div className={style.items}>
                    {this.props.soundsDefinition.required.map((item) => (
                        <SoundItem
                            {...item}
                            key={item.id}
                            onLoadDefaultClick={() => this.loadDefaultSound(item.id)}
                            soundData={this.state.requiredSoundsData[item.id]}
                        />
                    ))}
                </div>
                <button type="button" onClick={this.loadAllDefaultSounds}>
                    load all default sounds
                </button>
                <button type="button" disabled={Object.values(this.state.requiredSoundsData).length === 0} onClick={this.uploadSounds}>
                    upload sounds
                </button>
            </div>
        );
    }

}

export default SoundManager;