import prettysize from 'prettysize';
import { useTranslation } from 'react-i18next';
import style from './FlashDialog.module.scss';
import Dialog from './ui/Dialog';
import ProgressBar from './ui/ProgressBar';

export default function FlashDialog({ parsedLog, bytesToUpload }) {
    const progress = parsedLog.bytesProgress || 0;
    const { t } = useTranslation();
    return (
        <Dialog
            isOpen={!!parsedLog.chipEraseStart && !parsedLog.flashEnd && bytesToUpload > 0}
        >
            <div className={style.text}>
                <div className={style.title}>
                    {t('common.flashingInProgress')}
                </div>
            </div>
            <ProgressBar
                value={(progress / bytesToUpload)}
            />
            <div className={style.values}>
                {prettysize(progress)} / {prettysize(bytesToUpload)}
            </div>
        </Dialog>
    );
}