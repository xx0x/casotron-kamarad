import i18next from 'i18next';
import inBrowserDownload from 'in-browser-download';
import localforage from 'localforage';
import log from 'loglevel';
import moment from 'moment';
import React from 'react';
import { Trans } from 'react-i18next';
import { WaveFile } from 'wavefile';
import arrayMoveById from '../utils/arrayMoveById';
import createSoundFile from '../utils/createSoundFile';
import packSounds from '../utils/packSounds';
import removeExtension from '../utils/removeExtension';
import submitAndDecode from '../utils/submitAndDecode';
import unpackSounds from '../utils/unpackSounds';
import SoundItems from './SoundItems';
import style from './SoundManager.module.scss';
import Box from './ui/Box';
import Button from './ui/Button';
import Dropdown from './ui/Dropdown';
import FilePickerButton from './ui/FilePickerButton';
import Icon from './ui/Icon';
import Toolbar from './ui/Toolbar';
import UsedSpace from './UsedSpace';

const EMPTY_SOUND_DATA = {
    requiredSoundsData: {},
    alarmSoundsData: []
};

class SoundManager extends React.Component {

    constructor() {
        super();
        this.state = { ...EMPTY_SOUND_DATA };
        this.saveToFile = this.saveToFile.bind(this);
        this.saveLocally = this.saveLocally.bind(this);
        this.loadSetFromFile = this.loadSetFromFile.bind(this);
        this.updateRequiredSound = this.updateRequiredSound.bind(this);
        this.uploadSounds = this.uploadSounds.bind(this);
        this.loadSelectedSet = this.loadSelectedSet.bind(this);
        this.addAlarmSound = this.addAlarmSound.bind(this);
        this.isUploadEnabled = this.isUploadEnabled.bind(this);
    }

    componentDidMount() {
        this.loadLocally();
        console.log(this.props.availableSoundSets);
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
            const rdr = new FileReader();
            rdr.onload = (ev) => {
                unpackSounds(ev.target.result).then((u) => this.setState(u));
            };
            rdr.readAsArrayBuffer(file);
        });
    }

    loadLocally() {
        console.log('trying local load');
        localforage.getItem('sounds').then((data) => {
            if (data) {
                unpackSounds(data).then((u) => this.setState(u));
            }
        });
    }

    saveToFile() {
        packSounds(this.state.requiredSoundsData, this.state.alarmSoundsData).then((content) => {
            inBrowserDownload(content, `casotron_${moment().format('YYYYMMDD_HHmmss')}.casotron`);
        });
    }

    saveLocally() {
        packSounds(this.state.requiredSoundsData, this.state.alarmSoundsData).then((content) => {
            localforage.setItem('sounds', content);
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
                // wavFile.toBitDepth(16);
                // wavFile.toSampleRate(22050);
                rawData[id] = wavFile.data.samples;
            }
        });
        const alarmsStartId = this.props.soundsDefinition.alarms.idStartsWith;
        this.state.alarmSoundsData.forEach((alarm, index) => {
            const wavFile = new WaveFile(alarm.soundData);
            if (wavFile) {
                // wavFile.toBitDepth(16);
                // wavFile.toSampleRate(22050);
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

    loadSelectedSet() {
        this.setState(EMPTY_SOUND_DATA, () => {
            const filename = this.state.selectedSet.url;
            fetch(filename)
                .then((response) => response.blob())
                .then((blob) => {
                    unpackSounds(blob).then((u) => this.setState({ ...u, selectedSet: null }));
                });
        });
    }

    isUploadEnabled() {
        return Object.values(this.state.requiredSoundsData).length !== 0;
    }

    getUsedData() {
        return (
            Object.values(this.state.requiredSoundsData).map((x) => x.length).reduce((a, b) => a + b, 0) +
            (this.state.alarmSoundsData).map((x) => (x.soundData ? x.soundData.length : 0)).reduce((a, b) => a + b, 0)
        );
    }

    // eslint-disable-next-line class-methods-use-this
    getTotalData() {
        return 8 * 1024 * 1024;
    }

    render() {
        return (
            <div className={style.container}>
                <div className={style.boxes}>
                    <div className={style.boxes_columns}>

                        <Box
                            title={<Trans i18nKey="common.status" />}
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
                            title={<Trans i18nKey="common.availableSoundBanks" />}
                        >
                            <Toolbar offset>
                                <Dropdown
                                    options={this.props.availableSoundSets.map((set) => ({
                                        value: set.filename,
                                        label: set.title
                                    }))}
                                    placeholder={{ label: i18next.t('common.chooseSoundBank'), value: null }}
                                    value={this.state.selectedSet ? this.state.selectedSet.filename : ''}
                                    onChange={(filename) => this.setState({ selectedSet: filename ? this.props.availableSoundSets.find((x) => x.filename === filename) : null })}
                                />
                                <Button
                                    disabled={!this.state.selectedSet}
                                    onClick={this.loadSelectedSet}
                                >
                                    <Trans i18nKey="common.load" />
                                </Button>
                            </Toolbar>
                        </Box>
                        <Box
                            title={<Trans i18nKey="common.workFile" />}
                        >
                            <Toolbar offset>
                                <Button
                                    onClick={this.saveLocally}
                                >
                                    <Icon name="018-chrome" />
                                    <Trans i18nKey="common.saveInBrowser" />
                                </Button>
                                <Button
                                    onClick={this.saveToFile}
                                >
                                    <Icon name="034-diskette" />
                                    <Trans i18nKey="common.save" />
                                </Button>
                                <FilePickerButton
                                    accept=".casotron"
                                    onChange={this.loadSetFromFile}
                                >
                                    <Icon name="110-folder" />
                                    <Trans i18nKey="common.load" />
                                </FilePickerButton>
                            </Toolbar>
                            <UsedSpace
                                used={this.getUsedData()}
                                total={this.getTotalData()}
                            />
                        </Box>

                        <Box
                            title={<Trans i18nKey="common.melodies" />}
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
                                    <Icon name="112-plus" />
                                    <Trans i18nKey="common.addSound" />
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
                            title={<Trans i18nKey="common.annoucements" />}
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
                            />
                        </Box>
                    </div>
                </div>
            </div>
        );
    }

}

export default SoundManager;