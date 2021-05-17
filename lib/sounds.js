import fs from 'fs';
import path from 'path';
import soundDefintions from '../data/soundDefinitions.json';

const soundsDirectory = path.join(process.cwd(), 'public/sounds');

export function getAllSoundSets() {
    const folders = fs.readdirSync(soundsDirectory);
    return folders.map((setName) => {

        const setPath = path.join(soundsDirectory, setName);
        const setMainFile = path.join(setPath, 'contents.json');
        const contents = {
            name: setName,
            ...JSON.parse(fs.readFileSync(setMainFile, 'utf8')),
            alarms: []
        };

        const alarmFiles = fs.readdirSync(path.join(setPath, 'alarms'));
        contents.alarms = alarmFiles.map((alarmFile) => ({
            title: alarmFile.replace(/\.[a-zA-Z0-9]+$/, ''),
            filename: `/sounds/${setName}/alarms/${alarmFile}`
        }));

        const requiredFiles = fs.readdirSync(path.join(setPath, 'required'));
        contents.required = requiredFiles.map((requiredFile) => ({
            id: parseInt(requiredFile.replace(/\.[a-zA-Z0-9]+$/, ''), 10),
            filename: `/sounds/${setName}/required/${requiredFile}`
        }));

        return contents;
    });
}

export function getAllSoundDefinitions() {
    return soundDefintions;
}