import { useRef, useState } from 'react';
import SerialDeviceInfo from '../components/SerialDeviceInfo';
import SoundManager from '../components/SoundManager';
import Button from '../components/ui/Button';
import Header from '../components/ui/Header';
import { getAvailableSoundSets, getSoundsDefinition } from '../lib/sounds';

export async function getStaticProps() {
    return {
        props: {
            availableSoundSets: getAvailableSoundSets(),
            soundsDefinition: getSoundsDefinition()
        }
    };
}

export default function Home(props) {

    const soundManagerRef = useRef(null);
    const [port, setPort] = useState(null);
    return (
        <>
            <Header>
                <SerialDeviceInfo
                    port={port}
                    setPort={setPort}
                />
                <Button
                    onClick={() => soundManagerRef.current.uploadSounds()}
                    disabled={!port}
                >
                    upload sounds to device
                </Button>
            </Header>
            <SoundManager
                port={port}
                setPort={setPort}
                ref={soundManagerRef}
                availableSoundSets={props.availableSoundSets}
                soundsDefinition={props.soundsDefinition}
            />
        </>
    );
}
