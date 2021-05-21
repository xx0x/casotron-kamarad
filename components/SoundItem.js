/* eslint-disable jsx-a11y/no-static-element-interactions */
import { forwardRef, useEffect, useState } from 'react';
import { Button } from 'react95';
import Icon from './icons/Icon';
import Icons from './icons/Icons';
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
            className={style.container + (props.sortable ? (` ${style.sortable}`) : '')}
            style={props.style}
            {...props.attributes}
            {...props.listeners}
            onMouseDown={props.onMouseDown}
            role="button"
            tabIndex="0"
        >
            <h3 className={style.title}>{props.title || props.id}</h3>
            {props.transcription &&
                <p><em>{props.transcription}</em></p>
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
                    <Icon icon={Icons.FolderOpen} />
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