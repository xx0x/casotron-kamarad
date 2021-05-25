import classNames from 'classnames';
import style from './Toolbar.module.scss';

export default function Toolbar({ offset, children }) {

    return (
        <div
            className={classNames({
                [style.container]: true,
                [style.offset]: offset,
            })}
        >
            {children}
        </div>
    );
}