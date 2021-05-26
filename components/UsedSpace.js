import classNames from 'classnames';
import prettysize from 'prettysize';
import { useTranslation } from 'react-i18next';
import style from './UsedSpace.module.scss';

export default function UsedSpace({
    used, total
}) {

    const { t } = useTranslation();

    return (
        <div
            className={classNames({
                [style.container]: true,
                [style.error]: used > total,
            })}
        >
            <div className={style.title}>
                {t('common.usedSpace')}: {prettysize(used)} / {prettysize(total)}
            </div>
            <div className={style.bar}>
                <div style={{ transform: `scaleX(${used / total})` }} className={style.progress} />
                <div className={style.value}>{Math.floor((used / total) * 100)}%</div>
            </div>
        </div>
    );
}