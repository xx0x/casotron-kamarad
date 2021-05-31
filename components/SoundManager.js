/* eslint-disable react/sort-comp */
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
import generateId from '../utils/generateId';
import packSounds from '../utils/packSounds';
import removeExtension from '../utils/removeExtension';
import submitAndDecode from '../utils/submitAndDecode';
import unpackSounds from '../utils/unpackSounds';
import uploadSoundFile from '../utils/uploadSoundFile';
import DeviceInfo from './DeviceInfo';
import RandomSoundButton from './RandomSoundButton';
import SoundItems from './SoundItems';
import style from './SoundManager.module.scss';
import Box from './ui/Box';
import Button from './ui/Button';
import Dropdown from './ui/Dropdown';
import FilePickerButton from './ui/FilePickerButton';
import Header from './ui/Header';
import Icon from './ui/Icon';
import Log from './ui/Log';
import Toolbar from './ui/Toolbar';
import UsedSpace from './UsedSpace';

const EMPTY_SOUND_DATA = {
    requiredSoundsData: {},
    alarmSoundsData: []
};

const BAUDRATE = 115200;

class SoundManager extends React.Component {

    constructor() {
        super();
        this.state = {
            ...EMPTY_SOUND_DATA,
            port: null,
            device: null,
            totalData: 8 * 1024 * 1024,
            bytesToUpload: 0
        };
        this.saveToFile = this.saveToFile.bind(this);
        this.saveLocally = this.saveLocally.bind(this);
        this.loadSetFromFile = this.loadSetFromFile.bind(this);
        this.updateRequiredSound = this.updateRequiredSound.bind(this);
        this.uploadSounds = this.uploadSounds.bind(this);
        this.loadSelectedSet = this.loadSelectedSet.bind(this);
        this.addAlarmSound = this.addAlarmSound.bind(this);
        this.isUploadEnabled = this.isUploadEnabled.bind(this);
        this.clearCurrentWork = this.clearCurrentWork.bind(this);
        this.uploadTime = this.uploadTime.bind(this);
        this.onConnectClick = this.onConnectClick.bind(this);
        this.setPort = this.setPort.bind(this);
        this.logRef = React.createRef();
    }

    componentDidMount() {
        this.loadLocally();
    }

    onConnectClick() {
        if (!navigator.serial) {
            log.error('🔌 Serial interface not available.');
            return;
        }

        navigator.serial.requestPort().then((p) => {
            log.info('🔌 Port selected.', p);
            p.open({
                baudRate: BAUDRATE
            }).then(() => {
                log.info('🔌 Port opened.', p);
                this.setPort(p);
            }).catch((e) => {
                log.error('🔌 Cannot open port.', e);
            });
        }).catch(() => {
            this.setPort(null);
            log.warn('🔌 No port selected.');
        });
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

    addAlarmSound(name, wavData) {
        return new Promise((resolve) => {
            this.setState((prevState) => ({
                alarmSoundsData: [...prevState.alarmSoundsData, { id: generateId(), title: name, soundData: wavData }]
            }), resolve);
        });
    }

    uploadSounds() {
        if (this.logRef.current) {
            this.logRef.current.clear();
        }
        const rawData = {};
        Object.entries(this.state.requiredSoundsData).forEach(([id, wavData]) => {
            const wavFile = new WaveFile(wavData);
            if (wavFile) {
                rawData[id] = wavFile.data.samples;
            }
        });
        const alarmsStartId = this.props.soundsDefinition.alarms.idStartsWith;
        this.state.alarmSoundsData.forEach((alarm, index) => {
            const wavFile = new WaveFile(alarm.soundData);
            if (wavFile) {
                rawData[alarmsStartId + index] = wavFile.data.samples;
            }
        });
        const finalData = createSoundFile(rawData);
        this.setState({ bytesToUpload: finalData.length });
        uploadSoundFile(this.state.port, finalData);
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

    clearCurrentWork() {
        this.setState(EMPTY_SOUND_DATA);
        localforage.removeItem('sounds');
    }

    isUploadEnabled() {
        return this.state.device && this.state.port && Object.values(this.state.requiredSoundsData).length > 0 && this.state.alarmSoundsData.length > 0 && (this.getUsedData() <= this.getTotalData());
    }

    isEmpty() {
        return (this.getUsedData() === 0);
    }

    getUsedData() {
        return (
            Object.values(this.state.requiredSoundsData).map((x) => x.length).reduce((a, b) => a + b, 0) +
            (this.state.alarmSoundsData).map((x) => (x.soundData ? x.soundData.length : 0)).reduce((a, b) => a + b, 0)
        );
    }

    getTotalData() {
        return this.state.totalData;
    }

    setPort(p) {
        this.setState({ port: p, device: null }, () => {
            if (p && this.logRef.current) {
                const reader = p.readable.getReader();
                let readFromCom = null;
                const decoder = new TextDecoder();
                readFromCom = () => {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            reader.releaseLock();
                        }
                        const txt = decoder.decode(value);
                        this.logRef.current.append(txt);
                        readFromCom();
                    }).catch(() => {
                        this.setState({ port: null });
                    });
                };
                readFromCom();

                // request device info
                const writer = p.writable.getWriter();
                writer.write(new Uint8Array([63])).then(() => {
                    writer.releaseLock();
                });
            }
        });
    }

    uploadTime() {
        const writer = this.state.port.writable.getWriter();
        const time = moment().format('HHmmss').split('').map((x) => parseInt(x, 10));
        writer.write(new Uint8Array([37])).then(() => {
            log.debug('Starting to se time...');
            writer.write(new Uint8Array(time)).then(() => {
                log.debug('Time set!');
                writer.releaseLock();
            });
        });
    }

    render() {
        const isEmpty = this.isEmpty();
        return (
            <>
                <Header>
                    {!this.state.port &&
                        <Button
                            primary
                            onClick={this.onConnectClick}
                        >
                            <Icon name="066-usb" />
                            <Trans i18nKey="common.connectDevice" />
                        </Button>
                    }
                    {this.state.port &&
                        <>
                            <DeviceInfo
                                device={this.state.device}
                            />
                            <Button
                                primary
                                onClick={this.onDisconnectClick}
                            >
                                <Icon name="066-usb" />
                                <Trans i18nKey="common.disconnect" />
                            </Button>
                        </>
                    }
                    <Button
                        onClick={this.uploadTime}
                        disabled={!this.state.port || !this.state.device}
                    >
                        <Icon name="167-wall-clock" />
                        <Trans i18nKey="common.setTime" />
                    </Button>
                    <Button
                        onClick={this.uploadSounds}
                        disabled={!this.isUploadEnabled()}
                    >
                        <Icon name="057-upload" />
                        <Trans i18nKey="common.transferToDevice" />
                    </Button>
                </Header>
                <div className={style.container}>
                    <div className={style.boxes}>
                        <div className={style.boxes_columns}>
                            <Box
                                title={<Trans i18nKey="common.availableSoundBanks" />}
                            >
                                <Toolbar offset>
                                    <Dropdown
                                        options={this.props.availableSoundSets.map((set) => ({
                                            value: set.filename,
                                            label: set.title
                                        }))}
                                        flashing={isEmpty && !this.state.selectedSet}
                                        placeholder={{ label: i18next.t('common.chooseSoundBank'), value: null }}
                                        value={this.state.selectedSet ? this.state.selectedSet.filename : ''}
                                        onChange={(filename) => this.setState({ selectedSet: filename ? this.props.availableSoundSets.find((x) => x.filename === filename) : null })}
                                    />
                                    <Button
                                        disabled={!this.state.selectedSet}
                                        flashing={isEmpty && this.state.selectedSet}
                                        onClick={this.loadSelectedSet}
                                    >
                                        <Trans i18nKey="common.load" />
                                    </Button>
                                </Toolbar>
                                {this.state.selectedSet &&
                                    <div className={style.sound_set_description}>
                                        {this.state.selectedSet.description}
                                    </div>
                                }
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
                                        onClick={this.clearCurrentWork}
                                        disabled={isEmpty}
                                    >
                                        <Icon name="046-trash-can" />
                                        <Trans i18nKey="common.clearInBrowser" />
                                    </Button>
                                    <FilePickerButton
                                        accept=".casotron"
                                        onChange={this.loadSetFromFile}
                                    >
                                        <Icon name="110-folder" />
                                        <Trans i18nKey="common.load" />
                                    </FilePickerButton>
                                    <Button
                                        onClick={this.saveToFile}
                                        disabled={isEmpty}
                                    >
                                        <Icon name="034-diskette" />
                                        <Trans i18nKey="common.save" />
                                    </Button>
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

                            <Box
                                title={<Trans i18nKey="common.log" />}
                            >
                                <Log
                                    ref={this.logRef}
                                    onDeviceChange={(device) => this.setState({ device })}
                                    bytesToUpload={this.state.bytesToUpload}
                                />
                            </Box>
                        </div>
                        <div className={style.boxes_columns}>
                            <Box
                                title={<Trans i18nKey="common.annoucements" />}
                                action={(
                                    <RandomSoundButton
                                        samplesData={this.state.requiredSoundsData}
                                    />
                                )}
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
            </>
        );
    }

}

export default SoundManager;