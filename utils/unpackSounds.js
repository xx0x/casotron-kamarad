import JSZip from 'jszip';

export default function unpackSounds(sourceBlob) {

    return new Promise((finalResolve, finalReject) => {
        JSZip.loadAsync(sourceBlob).then((zipFile) => {
            zipFile.file('manifest').async('string').then((manifestDataString) => {
                const manifestData = JSON.parse(manifestDataString);
                if (manifestData.type === 'casotron-sound-data') {
                    console.log(manifestData);

                    Promise.all([
                        new Promise((alarmSoundsDataPromiseResolve) => {
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
                                    alarmSoundsDataPromiseResolve({ alarmSoundsData });
                                });
                            }
                        }),
                        new Promise((requiredSoundsDataPromiseResolve) => {
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
                                    requiredSoundsDataPromiseResolve({ requiredSoundsData: finalRequiredSoundsData });
                                });
                            }
                        })
                    ]).then((responses) => finalResolve((responses).reduce((a, b) => ({ ...a, ...b }), {})));
                }
            });
        });
    });
}