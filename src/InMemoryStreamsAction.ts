import { StreamsAction, StreamMessageHandler, StreamCollection, StreamPointerCollection } from './EventstoreEngine';
import { getNextEventStream } from './getNextEventStream';

export class InMemoryStreamsAction implements StreamsAction {
    private state: any;
    public streamPointers: StreamPointerCollection;
    public constructor(private getStreams: () => StreamCollection) {
        this.streamPointers = {};
    }
    public when(streamMessageHandler: StreamMessageHandler) {
        if (!this.state && streamMessageHandler.$init) {
            this.state = streamMessageHandler.$init();
        }

        const nextEventResult = getNextEventStream(this.getStreams(), this.streamPointers);
        if (!nextEventResult) {
            return;
        }
        const { streamName, event, streamPointer } = nextEventResult;

        this.streamPointers[streamName] = streamPointer;

        if (streamMessageHandler['$any']) {
            streamMessageHandler['$any'](this.state, event);
        }
        if (streamMessageHandler[event.eventType]) {
            streamMessageHandler[event.eventType](this.state, event);
        }
    }
}
