import React, { useState } from 'react';
import log from 'loglevel';

const BAUDRATE = 115200;

function SerialDeviceInfo() {

    const [port, setPort] = useState(null);

    return (
        <div>
            {port &&
                <div>
                    Device connected
                </div>
            }
            <button
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
                            setPort(p);
                        }).catch(() => {
                            log.error('🔌 Cannot open port.');
                        });
                    }).catch(() => {
                        setPort(null);
                        log.warn('🔌 No port selected.');
                    });
                }}
                type="button"
            >
                Connect to a device
            </button>
        </div>
    );
}

export default SerialDeviceInfo;