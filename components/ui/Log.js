import style from './Log.module.scss';

export default function Log() {
    return (
        <pre className={style.container} id="serialLog" />
    );
}