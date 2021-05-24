import JSZip from 'jszip';
import omit from 'lodash.omit';
import generateId from './generateId';

export default function packSounds(requiredSoundsData, alarmSoundsData) {
    const zipFile = new JSZip();
    const meta = { type: 'casotron-sound-data', alarmSounds: [], requiredSounds: {} };
    alarmSoundsData.forEach((obj) => {
        const file = generateId();
        const metaObj = {
            ...omit(obj, 'soundData'),
            file
        };
        meta.alarmSounds.push(metaObj);
        zipFile.file(file, obj.soundData);
    });
    Object.entries(requiredSoundsData).forEach(([id, soundData]) => {
        const file = generateId();
        meta.requiredSounds[id] = file;
        zipFile.file(file, soundData);
    });
    zipFile.file('manifest', JSON.stringify(meta));
    return zipFile.generateAsync({ type: 'blob' });
}