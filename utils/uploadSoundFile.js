import log from 'loglevel';

export default function uploadSoundFile(port, finalData) {
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