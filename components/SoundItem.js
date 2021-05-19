import { useEffect, useState } from 'react';
import style from './SoundItem.module.scss';
import FilePickerButton from './ui/FilePickerButton';

export default function SoundItem({
    id, title, transcription, soundData, onLoadDefaultClick, onClearClick, onReplaceSubmit
}) {

    const [audioObj, setAudioObj] = useState(null);
    useEffect(() => {
        setAudioObj(null);
    }, [soundData]);

    return (
        <div key={id} className={style.container}>
            <h3>{title || id}</h3>
            {transcription &&
                <p><em>{transcription}</em></p>
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
            {onReplaceSubmit &&
                <FilePickerButton
                    accept="audio/*"
                    onChange={onReplaceSubmit}
                >
                    {soundData ? 'Replace' : 'Upload'}
                </FilePickerButton>
            }
            <button
                type="button"
                disabled={!soundData}
                onClick={() => {
                    if (audioObj) {
                        audioObj.pause();
                        audioObj.currentTime = 0;
                        audioObj.play();
                    } else {
                        const ao = new Audio(URL.createObjectURL(new Blob([soundData])));
                        ao.play();
                        setAudioObj(ao);
                    }
                }}
            >
                Play
            </button>
        </div>
    );
}