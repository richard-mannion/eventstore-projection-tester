import {
    CategoryAction,
    Stream,
    StreamCollection,
    StreamMessageHandler,
    StreamPointer,
    StreamPointerCollection,
    Event,
} from './EventstoreEngine';
import { getNextStreamPointer } from './getNextStreamPointer';

export class InMemoryCategoryAction implements CategoryAction {
    private state: any;
    public streamPointers: StreamPointerCollection;
    public constructor(private getStreams: () => StreamCollection) {
        this.streamPointers = {};
    }

    private getNextEventStream(
        streamCollection: StreamCollection,
        streamPointers: StreamPointerCollection,
    ): { streamName: string; event: Event; streamPointer: number } | null {
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
    }

    public when(streamMessageHandler: StreamMessageHandler) {
        if (!this.state && streamMessageHandler.$init) {
            this.state = streamMessageHandler.$init();
        }
        const nextEventResult = this.getNextEventStream(this.getStreams(), this.streamPointers);
        if (!nextEventResult) {
            return;
        }
        const { streamName, event, streamPointer } = nextEventResult;

        this.streamPointers[streamName] = streamPointer;

        if (streamMessageHandler['$all']) {
            streamMessageHandler['$all'](this.state, event);
        }
        if (streamMessageHandler[event.eventType]) {
            streamMessageHandler[event.eventType](this.state, event);
        }
    }
}
