import Header from '../components/Header'
import SerialDeviceInfo from '../components/SerialDeviceInfo';
import SoundItem from '../components/SoundItem';
import { getAllSounds } from '../lib/sounds';



export async function getStaticProps() {
    return {
        props: {
            sounds: getAllSounds()
        }
    }
}

export default function Home(props) {
    return (
        <>
            <Header />
            <SerialDeviceInfo />

            {props.sounds.map((sound) => (
                <SoundItem {...sound} key={sound.id} />
            ))}
        </>
    );
}
