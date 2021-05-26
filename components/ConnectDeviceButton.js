import log from 'loglevel';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';
import Icon from './ui/Icon';

const BAUDRATE = 115200;

function ConnectDeviceButton(props) {
    const { t } = useTranslation();
    return (
        <>
            <Button
                disabled={!!props.port}
                primary
                onClick={() => {

                    if (!navigator.serial) {
                        log.error('🔌 Serial interface not available.');
                        return;
                    }

                    navigator.serial.requestPort().then((p) => {
                        log.info('🔌 Port selected.', p);
                        p.open({
                            baudRate: BAUDRATE
                        }).then(() => {
                            log.info('🔌 Port opened.', p);
                            props.setPort(p);
                        }).catch(() => {
                            log.error('🔌 Cannot open port.');
                        });
                    }).catch(() => {
                        props.setPort(null);
                        log.warn('🔌 No port selected.');
                    });
                }}
            >
                <Icon name="066-usb" />
                {t('common.connect')}
            </Button>
        </>
    );
}

export default ConnectDeviceButton;