const BATCH_BUFFER_SIZE = 8600;

export default function parseLogContents(contents) {

    const capacityMatches = contents.match(/Flash capacity: ([0-9]+)/);
    const alarmsMatches = contents.match(/Found alarms: ([0-9]+)/);
    const headerLengthMatches = contents.match(/Data header length: ([0-9]+)/);
    const bytesWrittenMatches = contents.match(/([0-9]+) bytes written./);
    const progressMatches = contents.match(/Starting flashing\.\r?\n(\.+)\r?\n/);

    const matches = {};
    matches.chipEraseStart = contents.search('Erasing chip.') > -1;
    matches.chipEraseEnd = contents.search('Chip erased.') > -1;
    matches.flashStart = contents.search('Starting flashing.') > -1;
    matches.flashEnd = contents.search('Flashing ended.') > -1;
    matches.flashCapacity = (capacityMatches && capacityMatches[1]) ? parseInt(capacityMatches[1], 10) : null;
    matches.alarmsCount = (alarmsMatches && alarmsMatches[1]) ? parseInt(alarmsMatches[1], 10) : null;
    matches.bytesWritten = (bytesWrittenMatches && bytesWrittenMatches[1]) ? parseInt(bytesWrittenMatches[1], 10) : null;
    matches.bytesProgress = (progressMatches && progressMatches[1]) ? progressMatches[1].length * BATCH_BUFFER_SIZE : null;
    matches.headerLength = (headerLengthMatches && headerLengthMatches[1]) ? parseInt(headerLengthMatches[1], 10) : null;

    return matches;
}