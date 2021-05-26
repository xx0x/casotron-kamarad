import classNames from 'classnames';
import style from './ProgressBar.module.scss';

export default function ProgressBar({
    value, error
}) {
    return (
        <div
            className={classNames({
                [style.container]: true,
                [style.error]: error
            })}
        >
            <div style={{ transform: `scaleX(${value})` }} className={style.progress} />
            <div className={style.value}>{Math.floor((value) * 100)}%</div>
        </div>
    );
}