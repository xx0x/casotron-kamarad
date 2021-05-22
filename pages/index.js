import { useRef } from 'react';
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
    return (
        <>
            <Header>
                <SerialDeviceInfo />
                <Button
                    onClick={() => soundManagerRef.current.uploadSounds()}
                >
                    upload sounds to device
                </Button>
            </Header>
            <SoundManager
                ref={soundManagerRef}
                availableSoundSets={props.availableSoundSets}
                soundsDefinition={props.soundsDefinition}
            />
        </>
    );
}
