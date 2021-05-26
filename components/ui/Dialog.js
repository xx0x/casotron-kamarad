import classNames from 'classnames';
import { useState } from 'react';
import Modal from 'react-modal';
import style from './Dialog.module.scss';

Modal.setAppElement('#__next');
const CLOSE_TIMEOUT = 500;

export default function Dialog(props) {

    const [closing, setClosing] = useState(false);

    return (
        <Modal
            isOpen={props.isOpen}
            closeTimeoutMS={CLOSE_TIMEOUT}
            contentLabel="Example Modal"
            overlayClassName={classNames({
                [style.overlay]: true,
                [style.overlayClosing]: closing
            })}
            className={classNames({
                [style.content]: true,
                [style.contentClosing]: closing,
                [style.wide]: props.wide
            })}
            onRequestClose={() => {
                props.onCloseClick();
                setClosing(true);
            }}
        >
            {props.children}
        </Modal>
    );
}