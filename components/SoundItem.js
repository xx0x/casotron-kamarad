import { useEffect, useState } from 'react';
import style from './SoundItem.module.scss';

export default function SoundItem({
    id, title, transcription, soundData, onLoadDefaultClick, onClearClick
}) {

    const [audioSrc, setAudioSrc] = useState(null);

    useEffect(() => {
        if (soundData) {
            setAudioSrc(URL.createObjectURL(new Blob([soundData])));
        }
    }, [soundData]);

    return (
        <div key={id} className={style.container}>
            <h3>{title || id}</h3>
            {transcription &&
                <p><em>{transcription}</em></p>
            }
            {audioSrc &&
                <audio
                    src={audioSrc}
                    controls
                />
            }
            {onLoadDefaultClick &&
                <button
                    type="button"
                    onClick={onLoadDefaultClick}
                >
                    Load default
                </button>
            }
            {onClearClick &&
                <button
                    type="button"
                    onClick={onClearClick}
                >
                    Clear
                </button>
            }
        </div>
    );
}