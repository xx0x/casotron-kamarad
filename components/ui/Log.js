import style from './Log.module.scss';

export default function Log({ children }) {
    return (
        <pre className={style.container}>
            {children}
        </pre>
    );
}