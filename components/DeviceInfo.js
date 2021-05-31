import prettysize from 'prettysize';
import { useTranslation } from 'react-i18next';
import style from './DeviceInfo.module.scss';

export default function DeviceInfo({ device }) {

    const { t } = useTranslation();

    if (!device) {
        return (
            <div className={style.container}>
                {t('common.unknownDevice')}
            </div>
        );
    }

    return (
        <div className={style.container}>
            <div className={style.title}>{device.name}</div>
            <div className={style.capacity}>
                {t('common.memorySize')}: {prettysize(device.flashCapacity)}
            </div>
        </div>
    );
}