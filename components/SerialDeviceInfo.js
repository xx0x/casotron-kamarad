import log from 'loglevel';
import React from 'react';
import Button from './ui/Button';

const BAUDRATE = 115200;

function SerialDeviceInfo(props) {

    return (
        <>
            {!props.port &&
                <Button
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
                    Connect to a device
                </Button>
            }
        </>
    );
}

export default SerialDeviceInfo;