/* eslint-disable jsx-a11y/no-static-element-interactions */
import { forwardRef, useEffect, useState } from 'react';
import style from './SoundItem.module.scss';
import FilePickerButton from './ui/FilePickerButton';

const SoundItem = forwardRef((props, ref) => {

    const [audioObj, setAudioObj] = useState(null);
    useEffect(() => {
        setAudioObj(null);
    }, [props.soundData]);
    return (
        <div
            key={props.id}
            ref={ref}
            className={style.container}
            style={props.style}
            {...props.attributes}
            {...props.listeners}
            onMouseDown={props.onMouseDown}
        >
            <h3>{props.title || props.id}</h3>
            {props.transcription &&
                <p><em>{props.transcription}</em></p>
            }
            {props.onLoadDefaultClick &&
                <button
                    type="button"
                    onClick={props.onLoadDefaultClick}
                >
                    Load default
                </button>
            }
            {props.onClearClick &&
                <button
                    type="button"
                    onClick={props.onClearClick}
                >
                    Clear
                </button>
            }
            {props.onReplaceSubmit &&
                <FilePickerButton
                    accept="audio/*"
                    onChange={props.onReplaceSubmit}
                >
                    {props.soundData ? 'Replace' : 'Upload'}
                </FilePickerButton>
            }
            <button
                type="button"
                disabled={!props.soundData}
                onClick={() => {
                    if (audioObj) {
                        audioObj.pause();
                        audioObj.currentTime = 0;
                        audioObj.play();
                    } else {
                        const ao = new Audio(URL.createObjectURL(new Blob([props.soundData])));
                        ao.play();
                        setAudioObj(ao);
                    }
                }}
            >
                Play
            </button>
        </div>
    );
});

export default SoundItem;