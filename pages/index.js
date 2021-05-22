import Header from '../components/ui/Header';
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
            <Header>
                <SerialDeviceInfo />
            </Header>
            <SoundManager
                availableSoundSets={props.availableSoundSets}
                soundsDefinition={props.soundsDefinition}
            />
        </>
    );
}
