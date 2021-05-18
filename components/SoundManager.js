import log from 'loglevel';
import React from 'react';
import { WaveFile } from 'wavefile';
import createSoundFile from '../utils/createSoundFile';
import customAudioBufferToWav from '../utils/customAudioBufferToWav';
import retrieveAndDecode from '../utils/retrieveAndDecode';
import SoundItem from './SoundItem';
import style from './SoundManager.module.scss';

class SoundManager extends React.Component {

    constructor() {
        super();
        this.state = {
            requiredSoundsData: {},
            alarmSoundsData: []
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
        const alarmsStartId = this.props.soundsDefinition.alarms.idStartsWith;
        this.state.alarmSoundsData.forEach((alarm, index) => {
            const wavFile = new WaveFile(alarm.soundData);
            if (wavFile) {
                wavFile.toBitDepth(16);
                wavFile.toSampleRate(22050);
                rawData[alarmsStartId + index] = wavFile.data.samples;
            }
        });
        log.warn(createSoundFile(rawData));
    }

    loadDefaultSound(id) {
        return new Promise((resolve) => {
            const soundSet = this.props.availableSoundSets[0];
            if (soundSet) {
                const defaultSound = soundSet.required.find((x) => x.id === id);
                if (defaultSound) {
                    retrieveAndDecode(defaultSound.filename).then((wavData) => {
                        this.updateRequiredSound(id, wavData).then(resolve);
                    });
                }
            }
        });
    }

    loadAllDefaultSounds() {

        // load required
        const idsToLoad = this.props.soundsDefinition.required.map((item) => (item.id));
        idsToLoad.reduce((p, id) => p.then(() => new Promise((resolve) => { this.loadDefaultSound(id).then(() => setTimeout(resolve, 500)); })), Promise.resolve()); // initial promise

        // load alarms
        const soundSet = this.props.availableSoundSets[0];
        if (soundSet && soundSet.alarms) {
            soundSet.alarms.reduce((p, alarm) => p.then(() => new Promise(
                (resolve) => retrieveAndDecode(alarm.filename).then((wavData) => {
                    this.setState((prevState) => ({
                        alarmSoundsData: [...prevState.alarmSoundsData, { id: alarm.id, soundData: wavData }]
                    }), () => setTimeout(resolve, 500));
                })
            )), Promise.resolve()); // initial promise
        }
    }

    render() {
        return (
            <div className={style.container}>
                MAIN<br />
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
                ADDITIONAL<br />
                <div className={style.items}>
                    {this.state.alarmSoundsData.map((item) => (
                        <SoundItem
                            {...item}
                            key={item.id}
                            onClearClick={() => this.setState((prevState) => ({ alarmSoundsData: prevState.alarmSoundsData.filter((x) => x.id !== item.id) }))}
                            // onLoadDefaultClick={() => this.loadDefaultSound(item.id)}
                            soundData={item.soundData}
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