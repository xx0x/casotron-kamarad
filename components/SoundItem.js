/* eslint-disable jsx-a11y/no-static-element-interactions */
import { forwardRef, useEffect, useState } from 'react';
import Icon from './icons/Icon';
import Icons from './icons/Icons';
import style from './SoundItem.module.scss';
import Button from './ui/Button';
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
            className={style.container + (props.sortable ? (` ${style.sortable}`) : '')}
            style={props.style}
            {...props.attributes}
            {...props.listeners}
            onMouseDown={props.onMouseDown}
            role="button"
            tabIndex="0"
        >
            <div className={style.title}>{props.title || props.id}</div>
            {props.transcription &&
                <div className={style.transcription}>„{props.transcription}“</div>
            }
            {props.onLoadDefaultClick &&
                <Button
                    onClick={props.onLoadDefaultClick}
                >
                    🔄
                </Button>
            }
            {props.onClearClick &&
                <Button
                    onClick={props.onClearClick}
                >
                    🚮
                </Button>
            }
            {props.onReplaceSubmit &&
                <FilePickerButton
                    accept="audio/*"
                    onChange={props.onReplaceSubmit}
                >
                    {
                        // props.soundData ? '📂' : '📂'
                    }
                    📂
                </FilePickerButton>
            }
            <Button
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
                ▶
            </Button>
        </div>
    );
});

export default SoundItem;