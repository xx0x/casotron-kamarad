import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useScrollbarSize from 'react-scrollbar-size';
import IntroDialog from '../components/IntroDialog';
import AppUnsupportedDialog from '../components/AppUnsupportedDialog';
import SerialDeviceInfo from '../components/SerialDeviceInfo';
import SoundManager from '../components/SoundManager';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import Icon from '../components/ui/Icon';
import { getIcons } from '../lib/icons';
import { getAvailableSoundSets, getSoundsDefinition } from '../lib/sounds';
import IconsContext from '../utils/IconsContext';
import isAppSupported from '../utils/isAppSupported';

export async function getStaticProps() {
    return {
        props: {
            availableSoundSets: getAvailableSoundSets(),
            soundsDefinition: getSoundsDefinition(),
            icons: getIcons()
        }
    };
}

export default function Home(props) {

    const soundManagerRef = useRef(null);
    const [port, setPort] = useState(null);
    const { t } = useTranslation();
    const [showIntroDialog, setShowIntroDialog] = useState(true);
    const [showUnsupportedDialog, setShowUnsupportedDialog] = useState(false);
    const scrollbarSize = useScrollbarSize();

    return (
        <>
            <IconsContext.Provider value={props.icons}>
                <div
                    style={{
                        '--app-scrollbar-width': `${scrollbarSize.width}px`
                    }}
                >
                    <Header>
                        <SerialDeviceInfo
                            port={port}
                            setPort={setPort}
                        />
                        <Button
                            onClick={() => soundManagerRef.current.uploadSounds()}
                            disabled={!port}
                        >
                            <Icon name="057-upload" />
                            {t('common.transferToDevice')}
                        </Button>
                    </Header>
                    <SoundManager
                        port={port}
                        setPort={setPort}
                        ref={soundManagerRef}
                        availableSoundSets={props.availableSoundSets}
                        soundsDefinition={props.soundsDefinition}
                    />
                    <IntroDialog
                        isOpen={showIntroDialog}
                        onCloseClick={() => {
                            setShowIntroDialog(false);
                            if (!isAppSupported()) {
                                setShowUnsupportedDialog(true);
                            }
                        }}
                    />
                    <AppUnsupportedDialog
                        isOpen={showUnsupportedDialog}
                        onCloseClick={() => {
                            setShowUnsupportedDialog(false);
                        }}
                    />
                </div>
            </IconsContext.Provider>
        </>
    );
}
