import prettysize from 'prettysize';
import { useTranslation } from 'react-i18next';
import ProgressBar from './ui/ProgressBar';
import style from './UsedSpace.module.scss';

export default function UsedSpace({
    used, total
}) {

    const { t } = useTranslation();

    return (
        <div
            className={style.container}
        >
            <div className={style.title}>
                {t('common.usedSpace')}: {prettysize(used)} / {prettysize(total)}
            </div>
            <ProgressBar
                error={used > total}
                value={used / total}
            />
        </div>
    );
}