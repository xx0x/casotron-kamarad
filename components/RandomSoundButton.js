import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import sayRandomTime from '../utils/sayRandomTime';
import Button from './ui/Button';
import Icon from './ui/Icon';

export default function RandomSoundButton({ samplesData }) {
    const [active, setActive] = useState(false);
    const { t } = useTranslation();
    return (
        <Button
            small
            loading={active}
            onClick={() => {
                setActive(true);
                sayRandomTime(samplesData).then(() => {
                    setActive(false);
                });
            }}
        >
            <Icon name="068-volume" />
            {t('common.testSound')}
        </Button>
    );
}