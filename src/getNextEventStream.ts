import { StreamCollection, StreamPointerCollection, Event } from './EventstoreEngine';
import { getNextStreamPointer } from './getNextStreamPointer';

export const getNextEventStream = (
    streamCollection: StreamCollection,
    streamPointers: StreamPointerCollection,
): { streamName: string; event: Event; streamPointer: number } | null => {
    let oldestEvent: Event | undefined;
    let oldestEventStreamName: string | undefined;
    let oldestPointer: number | undefined;
    Object.keys(streamCollection).forEach((key) => {
        const pointer = getNextStreamPointer(streamCollection[key], streamPointers[key]);

        if (pointer !== undefined) {
            const event = streamCollection[key].events[pointer];

            if (!oldestEvent || oldestEvent.created > event.created) {
                oldestEvent = event;
                oldestEventStreamName = key;
                oldestPointer = pointer;
            }
        }
    });
    if (oldestEventStreamName && oldestEvent && oldestPointer !== undefined) {
        return { streamName: oldestEventStreamName, event: oldestEvent, streamPointer: oldestPointer };
    }
    return null;
};
