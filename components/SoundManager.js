/* eslint-disable react/sort-comp */
import i18next from 'i18next';
import inBrowserDownload from 'in-browser-download';
import localforage from 'localforage';
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
import SoundItems from './SoundItems';
import style from './SoundManager.module.scss';
import Box from './ui/Box';
import Button from './ui/Button';
import Dropdown from './ui/Dropdown';
import Header from './ui/Header';
import ConnectDeviceButton from './ConnectDeviceButton';
import FilePickerButton from './ui/FilePickerButton';
import Icon from './ui/Icon';
import Log from './ui/Log';
import Toolbar from './ui/Toolbar';
import UsedSpace from './UsedSpace';

const EMPTY_SOUND_DATA = {
    requiredSoundsData: {},
    alarmSoundsData: []
};

class SoundManager extends React.Component {

    constructor() {
        super();
        this.state = {
            ...EMPTY_SOUND_DATA,
            port: null,
            totalData: 8 * 1024 * 1024
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
        this.setPort = this.setPort.bind(this);
        this.logRef = React.createRef();
    }

    componentDidMount() {
        this.loadLocally();
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
        setTimeout(() => {
            uploadSoundFile(this.state.port, createSoundFile(rawData));
        }, 500);
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
        return this.state.port && Object.values(this.state.requiredSoundsData).length > 0 && this.state.alarmSoundsData.length > 0 && (this.getUsedData() <= this.getTotalData());
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
        this.setState({ port: p }, () => {
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
                        setTimeout(() => {
                            readFromCom();
                        }, 100);
                    }).catch(() => {
                        this.setState({ port: null });
                    });
                };
                readFromCom();
            }
        });
    }

    render() {
        const isEmpty = this.isEmpty();
        return (
            <>
                <Header>
                    <ConnectDeviceButton
                        port={this.state.port}
                        setPort={this.setPort}
                    />
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
            </>
        );
    }

}

export default SoundManager;