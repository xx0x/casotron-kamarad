import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import SoundItem from './SoundItem';

export default function SoundItems(props) {

    return (
        <div className={props.className}>
            <DndContext>
                <SortableContext items={props.items}>
                    {props.items.map((item) => (
                        <SoundItem
                            {...item}
                            key={item.id}
                            onClearClick={() => props.onItemClearClick(item)}
                            soundData={item.soundData}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}