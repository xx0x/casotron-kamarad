import { useRef, useState } from 'react';
import SerialDeviceInfo from '../components/SerialDeviceInfo';
import SoundManager from '../components/SoundManager';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import Icon from '../components/ui/Icon';
import { getIcons } from '../lib/icons';
import { getAvailableSoundSets, getSoundsDefinition } from '../lib/sounds';
import IconsContext from '../utils/IconsContext';

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
    return (
        <>
            <IconsContext.Provider value={props.icons}>
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
                        Upload to the device
                    </Button>
                </Header>
                <SoundManager
                    port={port}
                    setPort={setPort}
                    ref={soundManagerRef}
                    availableSoundSets={props.availableSoundSets}
                    soundsDefinition={props.soundsDefinition}
                />
            </IconsContext.Provider>
        </>
    );
}
