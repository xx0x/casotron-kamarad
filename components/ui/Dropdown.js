import classNames from 'classnames';
import style from './Dropdown.module.scss';

export default function Dropdown(props) {

    return (
        <select
            className={classNames({
                [style.container]: true,
                [style.small]: props.small,
                [style.flashing]: props.flashing
            })}
            value={props.value}
            onChange={(e) => props.onChange(e.target.options[e.target.selectedIndex].value)}
        >
            {props.placeholder &&
                <option value={props.placeholder.value}>{props.placeholder.label}</option>
            }
            {props.options.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
            ))}
        </select>
    );
}