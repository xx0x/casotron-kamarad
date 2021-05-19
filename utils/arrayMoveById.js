import arrayMove from 'array-move';

export default function arrayMoveById(items, oldId, newId) {
    const oldIndex = items.findIndex((x) => x.id === oldId);
    const newIndex = items.findIndex((x) => x.id === newId);
    if (oldIndex >= 0 && newIndex >= 0) {
        return arrayMove(items, oldIndex, newIndex);
    }
    return items;
}