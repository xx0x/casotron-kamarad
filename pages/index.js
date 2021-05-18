import Header from '../components/Header';
import SerialDeviceInfo from '../components/SerialDeviceInfo';
import SoundManager from '../components/SoundManager';
import { getSoundsDefinition, getAvailableSoundSets } from '../lib/sounds';

export async function getStaticProps() {
    return {
        props: {
            availableSoundSets: getAvailableSoundSets(),
            soundsDefinition: getSoundsDefinition()
        }
    };
}

export default function Home(props) {
    return (
        <>
            <Header />
            <SerialDeviceInfo />

            <SoundManager
                availableSoundSets={props.availableSoundSets}
                soundsDefinition={props.soundsDefinition}
            />
        </>
    );
}
