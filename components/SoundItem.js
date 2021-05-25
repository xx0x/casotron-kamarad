/* eslint-disable jsx-a11y/no-static-element-interactions */
import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import style from './SoundItem.module.scss';
import Button from './ui/Button';
import FilePickerButton from './ui/FilePickerButton';
import Icon from './ui/Icon';

const SoundItem = forwardRef((props, ref) => {

    const [audioObj, setAudioObj] = useState(null);
    useEffect(() => {
        setAudioObj(null);
    }, [props.soundData]);

    const { t } = useTranslation();

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
            {props.onClearClick &&
                <Button
                    small
                    onClick={props.onClearClick}
                >
                    <Icon name="046-trash-can" />
                    {t('common.delete')}

                </Button>
            }
            {props.onReplaceSubmit &&
                <FilePickerButton
                    buttonProps={{
                        small: true
                    }}
                    accept="audio/*"
                    onChange={props.onReplaceSubmit}
                >
                    <Icon name="110-folder" />
                    {t('common.choose')}
                </FilePickerButton>
            }
            <Button
                disabled={!props.soundData}
                small
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
                <Icon name="091-play-button" />
                {t('common.play')}
            </Button>
        </div>
    );
});

export default SoundItem;