import Dialog from './ui/Dialog';

export default function FlashDialog({ parsedLog }) {

    return (
        <Dialog
            isOpen={!!parsedLog.chipEraseStart && !parsedLog.flashEnd}
        >
            Flashing in processs...<br />
            Approx. bytes written: {parsedLog.bytesProgress || 'not started yet'}<br />
            Total bytes written: {parsedLog.bytesWritten || 'not finished yet'}

        </Dialog>
    );
}