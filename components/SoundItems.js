import {
    closestCenter,
    DndContext,
    MouseSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    rectSortingStrategy, SortableContext,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import SoundItem from './SoundItem';

function SortableSoundItem(props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    return (
        <SoundItem {...props.innerProps} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {props.children}
        </SoundItem>
    );
}

export default function SoundItems(props) {

    const sensors = useSensors(
        useSensor(MouseSensor)
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            props.onMove(active.id, over.id);
        }
    };

    if (!props.sortable) {
        return (
            <div className={props.className}>
                {props.items.map((item) => (
                    <SoundItem
                        {...item}
                        key={item.id}
                        onReplaceSubmit={(file) => props.onItemReplaceSubmit(item, file)}
                        onLoadDefaultClick={() => props.onItemLoadDefaultClick(item)}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={props.className}>
            {props.items.length > 0 &&
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={props.items}
                        strategy={rectSortingStrategy}
                    >
                        {props.items.map((item) => (
                            <SortableSoundItem
                                key={item.id}
                                id={item.id}
                                innerProps={{
                                    ...item,
                                    onClearClick: () => props.onItemClearClick(item)
                                }}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            }
        </div>
    );
}