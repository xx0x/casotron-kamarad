import classNames from 'classnames';
import Modal from 'react-modal';
import style from './Dialog.module.scss';

Modal.setAppElement('#__next');
const CLOSE_TIMEOUT = 300;

export default function Dialog(props) {

    return (
        <Modal
            isOpen={props.isOpen}
            closeTimeoutMS={CLOSE_TIMEOUT}
            contentLabel="Example Modal"
            bodyOpenClassName="app-dialog-open"
            overlayClassName={{
                base: style.overlay,
                beforeClose: style.overlayClosing
            }}
            className={{
                base: classNames({
                    [style.content]: true,
                    [style.wide]: props.wide
                }),
                beforeClose: style.contentClosing
            }}
            onRequestClose={() => {
                props.onCloseClick();
            }}
        >
            {props.children}
        </Modal>
    );
}