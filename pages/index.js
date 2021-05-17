import Header from '../components/Header';
import SerialDeviceInfo from '../components/SerialDeviceInfo';
import SoundItems from '../components/SoundItems';
import { getAllSoundDefinitions, getAllSoundSets } from '../lib/sounds';

export async function getStaticProps() {
    return {
        props: {
            soundSets: getAllSoundSets(),
            soundDefintions: getAllSoundDefinitions()
        }
    };
}

export default function Home(props) {
    return (
        <>
            <Header />
            <SerialDeviceInfo />

            <SoundItems
                soundSets={props.soundSets}
                items={props.soundDefintions.requiredSounds}
            />
        </>
    );
}
