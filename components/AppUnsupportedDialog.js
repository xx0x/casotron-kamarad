import style from './AppUnsupportedDialog.module.scss';
import Dialog from './ui/Dialog';
import Icon from './ui/Icon';

export default function AppUnsupportedDialog(props) {
    return (
        <Dialog
            isOpen={props.isOpen}
            onCloseClick={props.onCloseClick}
        >
            <div
                className={style.text}
            >
                <Icon className={style.icon} name="085-sad" />
                <h2>
                    Prohlížeč není podporován.
                </h2>
                <p>
                    Aplikace závisí na podpoře Web Serial API, které je dostupné pouze v prohlížečích Chrome 89+ a Edge 89+ na stolních počítačích.
                </p>
            </div>
        </Dialog>
    );
}