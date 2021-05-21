import log from 'loglevel';
import React from 'react';
import {
    Button, Toolbar, Window, WindowContent, WindowHeader
} from 'react95';
import { WaveFile } from 'wavefile';
import arrayMoveById from '../utils/arrayMoveById';
import createSoundFile from '../utils/createSoundFile';
import removeExtension from '../utils/removeExtension';
import retrieveAndDecode from '../utils/retrieveAndDecode';
import submitAndDecode from '../utils/submitAndDecode';
import Icon from './icons/Icon';
import Icons from './icons/Icons';
import SoundItems from './SoundItems';
import style from './SoundManager.module.scss';
import FilePickerButton from './ui/FilePickerButton';

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
        this.addAlarmSound = this.addAlarmSound.bind(this);
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

    addAlarmSound(id, wavData) {
        return new Promise((resolve) => {
            this.setState((prevState) => ({
                alarmSoundsData: [...prevState.alarmSoundsData, { id, soundData: wavData }]
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
        idsToLoad.reduce((p, id) => p.then(() => this.loadDefaultSound(id)), Promise.resolve()); // initial promise

        // load alarms
        const soundSet = this.props.availableSoundSets[0];
        if (soundSet && soundSet.alarms) {
            soundSet.alarms.reduce((p, alarm) => p.then(() => new Promise(
                (resolve) => retrieveAndDecode(alarm.filename).then((wavData) => {
                    this.addAlarmSound(alarm.id, wavData).then(resolve);
                })
            )), Promise.resolve()); // initial promise
        }
    }

    render() {
        return (
            <div className={style.container}>
                <br />
                <br />
                <br />
                <br />
                <Button
                    onClick={this.loadAllDefaultSounds}
                >
                    Load All Default Sounds
                </Button>
                <Button
                    disabled={Object.values(this.state.requiredSoundsData).length === 0}
                    onClick={this.uploadSounds}
                >
                    upload sounds to device
                </Button>

                <div className={style.windows}>

                    <Window>
                        <WindowHeader>
                            🎵
                            Alarms
                        </WindowHeader>
                        <Toolbar>
                            <FilePickerButton
                                buttonProps={{
                                    variant: 'menu',
                                    size: 'sm'
                                }}
                                accept="audio/*"
                                onChange={(file) => {
                                    submitAndDecode(file).then((wavData) => this.addAlarmSound(removeExtension(file.name), wavData));
                                }}
                            >
                                Add new sound
                            </FilePickerButton>
                        </Toolbar>
                        <WindowContent>
                            <SoundItems
                                className={style.items}
                                items={this.state.alarmSoundsData}
                                sortable
                                onMove={(oldId, newId) => {
                                    this.setState((prevState) => ({
                                        alarmSoundsData: arrayMoveById(prevState.alarmSoundsData, oldId, newId)
                                    }));
                                }}
                                onItemClearClick={(item) => {
                                    this.setState((prevState) => ({ alarmSoundsData: prevState.alarmSoundsData.filter((x) => x.id !== item.id) }));
                                }}
                            />
                        </WindowContent>
                    </Window>
                    <Window>
                        <WindowHeader>
                            <Icon icon={Icons.Voice} />
                            Voice
                        </WindowHeader>
                        <WindowContent>
                            <SoundItems
                                className={style.items}
                                items={this.props.soundsDefinition.required.map((item) => ({
                                    ...item,
                                    soundData: this.state.requiredSoundsData[item.id]
                                }))}
                                onItemReplaceSubmit={(item, file) => {
                                    submitAndDecode(file).then((wavData) => {
                                        this.updateRequiredSound(item.id, wavData);
                                    });
                                }}
                                onItemLoadDefaultClick={(item) => this.loadDefaultSound(item.id)}
                            />
                        </WindowContent>
                    </Window>
                </div>
            </div>
        );
    }

}

export default SoundManager;