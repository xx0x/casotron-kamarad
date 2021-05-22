import style from './Box.module.scss';

function Box(props) {

    return (
        <div
            className={style.container}
        >
            <div
                className={style.header}
            >
                <div
                    className={style.title}
                >
                    {props.title}
                </div>
                <div
                    className={style.action}
                >
                    {props.action}
                </div>
            </div>
            <div
                className={style.content}
            >
                {props.children}
            </div>
        </div>
    );
}

export default Box;