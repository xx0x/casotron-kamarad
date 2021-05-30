export default function parseLogContents(contents) {

    const capacityMatches = contents.match(/Flash capacity: ([0-9]+)/);
    const alarmsMatches = contents.match(/Found alarms: ([0-9]+)/);
    const headerLengthMatches = contents.match(/Data header length: ([0-9]+)/);
    const totalBytesMatches = contents.match(/Total bytes: ([0-9]+)/);
    let progressMatches = [...contents.matchAll(/Bytes written: ([0-9]+)/g)];
    if (progressMatches && progressMatches.length > 0) {
        progressMatches = progressMatches.pop();
    }
    const matches = {};
    matches.chipEraseStart = contents.search('Erasing chip') > -1;
    matches.chipEraseEnd = contents.search('Chip erased') > -1;
    matches.flashStart = contents.search('Starting flashing') > -1;
    matches.flashEnd = contents.search('Flashing ended') > -1;
    matches.flashCapacity = (capacityMatches && capacityMatches[1]) ? parseInt(capacityMatches[1], 10) : null;
    matches.alarmsCount = (alarmsMatches && alarmsMatches[1]) ? parseInt(alarmsMatches[1], 10) : null;
    matches.bytesWritten = (totalBytesMatches && totalBytesMatches[1]) ? parseInt(totalBytesMatches[1], 10) : null;
    matches.bytesProgress = (progressMatches && progressMatches[1]) ? parseInt(progressMatches[1], 10) : null;
    matches.headerLength = (headerLengthMatches && headerLengthMatches[1]) ? parseInt(headerLengthMatches[1], 10) : null;

    const deviceMatches = contents.match(/Device: ([a-zA-Z0-9]+)/);
    const deviceCapacityMatches = contents.match(/Capacity: ([0-9]+)/);
    const device = {};
    device.name = (deviceMatches && deviceMatches[1]) ? deviceMatches[1] : null;
    device.flashCapacity = (deviceCapacityMatches && deviceCapacityMatches[1]) ? parseInt(deviceCapacityMatches[1], 10) : null;
    matches.device = device;

    return matches;
}