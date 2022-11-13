import {
    CategoryAction,
    Stream,
    StreamCollection,
    StreamMessageHandler,
    StreamPointer,
    StreamPointerCollection,
    Event,
} from './EventstoreEngine';

export class InMemoryCategoryAction implements CategoryAction {
    private state: any;
    public streamPointers: StreamPointerCollection;
    public constructor(private getStreams: () => StreamCollection) {
        this.streamPointers = {};
    }

    getNextStreamPointer(stream: Stream, streamPointer: StreamPointer): number | undefined {
        if (stream.events.length === 0) {
            return;
        }
        if (streamPointer === undefined) {
            streamPointer = 'START';
        }
        if (streamPointer === stream.events.length - 1) {
            return;
        }

        return streamPointer === 'START' ? 0 : streamPointer + 1;
    }

    private getNextEventStream(
        streamCollection: StreamCollection,
        streamPointers: StreamPointerCollection,
    ): { streamName: string; event: Event; streamPointer: number } | null {
        let oldestEvent: Event | undefined;
        let oldestEventStreamName: string | undefined;
        let oldestPointer: number | undefined;
        Object.keys(streamCollection).forEach((key) => {
            const pointer = this.getNextStreamPointer(streamCollection[key], streamPointers[key]);

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
        //console.log('Result:', nextEventResult);
        this.streamPointers[streamName] = streamPointer;

        if (streamMessageHandler['$all']) {
            streamMessageHandler['$all'](this.state, event);
        }
        if (streamMessageHandler[event.eventType]) {
            streamMessageHandler[event.eventType](this.state, event);
        }
    }
}
