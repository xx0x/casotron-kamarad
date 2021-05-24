import inBrowserDownload from 'in-browser-download';
import JSZip from 'jszip';
import log from 'loglevel';
import moment from 'moment';
import React from 'react';
import { WaveFile } from 'wavefile';
import arrayMoveById from '../utils/arrayMoveById';
import createSoundFile from '../utils/createSoundFile';
import generateId from '../utils/generateId';
import removeExtension from '../utils/removeExtension';
import retrieveAndDecode from '../utils/retrieveAndDecode';
import submitAndDecode from '../utils/submitAndDecode';
import SoundItems from './SoundItems';
import style from './SoundManager.module.scss';
import Box from './ui/Box';
import Button from './ui/Button';
import FilePickerButton from './ui/FilePickerButton';

const EMPTY_SOUND_DATA = {
    requiredSoundsData: {},
    alarmSoundsData: []
};

class SoundManager extends React.Component {

    constructor() {
        super();
        this.state = { ...EMPTY_SOUND_DATA };
        this.saveCurrentSet = this.saveCurrentSet.bind(this);
        this.loadSetFromFile = this.loadSetFromFile.bind(this);
        this.updateRequiredSound = this.updateRequiredSound.bind(this);
        this.uploadSounds = this.uploadSounds.bind(this);
        this.loadDefaultSound = this.loadDefaultSound.bind(this);
        this.loadAllDefaultSounds = this.loadAllDefaultSounds.bind(this);
        this.addAlarmSound = this.addAlarmSound.bind(this);
        this.isUploadEnabled = this.isUploadEnabled.bind(this);
    }

    componentDidUpdate(prevProps) {

        if (this.props.port && prevProps.port !== this.props.port) {
            const port = this.props.port;
            console.log('port open');
            const reader = port.readable.getReader();
            let readFromCom = null;
            readFromCom = () => {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        // Allow the serial port to be closed later.
                        reader.releaseLock();
                    }
                    // value is a Uint8Array.
                    console.log(new TextDecoder().decode(value));
                    readFromCom();
                }).catch(() => {
                    this.props.setPort(null);
                });
            };
            readFromCom();
        }
    }

    loadSetFromFile(file) {

        this.setState(EMPTY_SOUND_DATA, () => {
            // Reader will go here
            const rdr = new FileReader();
            rdr.onload = (ev) => {
                JSZip.loadAsync(ev.target.result).then((zipFile) => {
                    zipFile.file('manifest').async('string').then((manifestDataString) => {
                        const manifestData = JSON.parse(manifestDataString);
                        if (manifestData.type === 'casotron-sound-data') {
                            console.log(manifestData);
                            if (manifestData.alarmSounds && manifestData.alarmSounds.length > 0) {
                                Promise.all(manifestData.alarmSounds.map((sound) => new Promise((resolve, reject) => {
                                    if (sound.file) {
                                        zipFile.file(sound.file).async('uint8array').then((soundData) => {
                                            resolve({
                                                id: sound.id,
                                                soundData
                                            });
                                        });
                                        return;
                                    }
                                    reject(new Error('Missing file'));
                                }))).then((alarmSoundsData) => {
                                    this.setState({ alarmSoundsData });
                                    console.log(alarmSoundsData);
                                });
                            }
                            if (manifestData.requiredSounds && Object.values(manifestData.requiredSounds).length > 0) {
                                Promise.all(Object.entries(manifestData.requiredSounds).map(([id, filename]) => new Promise((resolve, reject) => {
                                    if (filename) {
                                        zipFile.file(filename).async('uint8array').then((soundData) => {
                                            resolve({
                                                id,
                                                soundData
                                            });
                                        });
                                        return;
                                    }
                                    reject(new Error('Missing file'));
                                }))).then((requiredSoundsData) => {
                                    const finalRequiredSoundsData = {};
                                    requiredSoundsData.forEach((obj) => {
                                        finalRequiredSoundsData[obj.id] = obj.soundData;
                                    });
                                    this.setState({ requiredSoundsData: finalRequiredSoundsData });
                                    console.log(requiredSoundsData);
                                });
                            }
                        }
                    });
                });
            };
            rdr.readAsArrayBuffer(file);
        });
    }

    saveCurrentSet() {

        const zipFile = new JSZip();
        const meta = { type: 'casotron-sound-data', alarmSounds: [], requiredSounds: {} };
        this.state.alarmSoundsData.forEach((obj) => {
            const file = generateId();
            const metaObj = {
                id: obj.id,
                file
            };
            meta.alarmSounds.push(metaObj);
            zipFile.file(file, obj.soundData);
        });
        Object.entries(this.state.requiredSoundsData).forEach(([id, soundData]) => {
            const file = generateId();
            meta.requiredSounds[id] = file;
            zipFile.file(file, soundData);
        });
        zipFile.file('manifest', JSON.stringify(meta));
        zipFile.generateAsync({ type: 'blob' })
            .then((content) => {
                inBrowserDownload(content, `casotron_${moment().format('YYYYMMDD_HHmmss')}.xx0x`);
            });
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
        const finalData = createSoundFile(rawData);
        // inBrowserDownload(finalData.buffer, 'samples-kamarad.dat');
        const port = this.props.port;
        if (port) {
            console.log('Port OK');
            const writer = port.writable.getWriter();
            writer.write(new Uint8Array([64])).then(() => {
                log.debug('Starting to upload...');
                writer.write(finalData).then(() => {
                    log.debug('DONE!!!!');
                    writer.releaseLock();
                });
            });

        } else {
            console.error('Port not available...');
        }
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
        this.setState(EMPTY_SOUND_DATA, () => {
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
        });
    }

    isUploadEnabled() {
        return Object.values(this.state.requiredSoundsData).length !== 0;
    }

    render() {
        return (
            <div className={style.container}>
                <div className={style.boxes}>
                    <div className={style.boxes_columns}>

                        <Box
                            title="Device"
                        >
                            {this.props.port &&
                                <>
                                    Connected!
                                </>
                            }
                            {!this.props.port &&
                                <>
                                    Not connected
                                </>
                            }
                        </Box>
                        <Box
                            title="Sound Sets"
                            action={(
                                <>
                                    <Button
                                        small
                                        onClick={this.loadAllDefaultSounds}
                                    >
                                        Load Default
                                    </Button>
                                    <Button
                                        small
                                        onClick={this.saveCurrentSet}
                                    >
                                        Save to file
                                    </Button>
                                    <FilePickerButton
                                        buttonProps={{
                                            small: true
                                        }}
                                        accept=".xx0x"
                                        onChange={this.loadSetFromFile}
                                    >
                                        Load from file
                                    </FilePickerButton>
                                </>
                            )}
                        />

                        <Box
                            title="Alarms"
                            action={(
                                <FilePickerButton
                                    buttonProps={{
                                        small: true
                                    }}
                                    accept="audio/*"
                                    onChange={(file) => {
                                        submitAndDecode(file).then((wavData) => this.addAlarmSound(removeExtension(file.name), wavData));
                                    }}
                                >
                                    Add new sound
                                </FilePickerButton>
                            )}
                        >
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

                        </Box>
                    </div>
                    <div className={style.boxes_columns}>
                        <Box
                            title="Voice"
                        >
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
                        </Box>
                    </div>
                </div>
            </div>
        );
    }

}

export default SoundManager;