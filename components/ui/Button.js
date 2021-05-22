import classNames from 'classnames';
import style from './Button.module.scss';

function Button(props) {

    const TagName = props.tagName;
    return (
        <TagName
            type={TagName === 'button' ? 'button' : null}
            onClick={props.onClick}
            className={classNames({
                [style.container]: true,
                [style.primary]: props.primary,
                [style.secondary]: props.secondary,
                [style.outline]: props.outline
            })}
        >
            {props.children}
        </TagName>
    );
}

Button.defaultProps = {
    tagName: 'button'
};

export default Button;