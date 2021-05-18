import { useEffect, useState } from 'react';
import style from './SoundItem.module.scss';

export default function SoundItem({
    id, title, transcription, soundData, onLoadDefaultClick
}) {

    const [audioSrc, setAudioSrc] = useState(null);

    useEffect(() => {
        if (soundData) {
            setAudioSrc(URL.createObjectURL(new Blob([soundData])));
        }
    }, [soundData]);

    return (
        <div key={id} className={style.container}>
            <h3>{title}</h3>
            <p><em>{transcription}</em></p>

            <audio
                src={audioSrc}
                controls
            />

            <button
                type="button"
                onClick={onLoadDefaultClick}
            >
                Load default
            </button>
        </div>
    );
}