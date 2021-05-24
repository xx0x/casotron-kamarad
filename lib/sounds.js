import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import soundsDefintion from '../data/soundsDefinition.json';

const soundsDirectory = path.join(process.cwd(), 'public/sounds');

export function getAvailableSoundSets() {
    return fs.readdirSync(soundsDirectory).map((filename) => {
        const manifestData = {};
        const zipFile = new AdmZip(path.join(soundsDirectory, filename));
        const zipEntries = zipFile.getEntries(); // an array of ZipEntry records
        zipEntries.forEach((zipEntry) => {
            if (zipEntry.entryName === 'manifest') {
                const parsed = JSON.parse(zipEntry.getData().toString('utf8'));
                if (parsed) {
                    manifestData.title = parsed.title;
                    manifestData.description = parsed.description;
                }
            }
        });
        return ({
            name: filename,
            url: `/sounds/${filename}`,
            ...manifestData
        });
    });
}

export function getSoundsDefinition() {
    return soundsDefintion;
}