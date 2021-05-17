import SoundItem from './SoundItem';
import style from './SoundItems.module.scss';

export default function SoundItems({ items, soundSets }) {

    return (
        <div className={style.container}>
            {items.map((item) => (
                <SoundItem
                    {...item}
                    key={item.id}
                    soundSets={soundSets}
                />
            ))}
        </div>
    );
}