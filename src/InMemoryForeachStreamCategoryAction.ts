import {
    ForeachStreamCategoryAction,
    Stream,
    StreamCollection,
    StreamMessageHandler,
    StreamPointer,
    StreamPointerCollection,
    Event,
} from './EventstoreEngine';
import { getNextEventStream } from './getNextEventStream';

export class InMemoryForeachCategoryAction implements ForeachStreamCategoryAction {
    public state: { [key: string]: any };
    public streamPointers: StreamPointerCollection;
    public constructor(private getStreams: () => StreamCollection) {
        this.streamPointers = {};
        this.state = {};
    }

    public when(streamMessageHandler: StreamMessageHandler) {
        const nextEventResult = getNextEventStream(this.getStreams(), this.streamPointers);
        if (!nextEventResult) {
            return;
        }
        const { streamName, event, streamPointer } = nextEventResult;
        if (!this.state[streamName] && streamMessageHandler.$init) {
            this.state[streamName] = streamMessageHandler.$init();
        }
        this.streamPointers[streamName] = streamPointer;

        if (streamMessageHandler['$all']) {
            streamMessageHandler['$all'](this.state[streamName], event);
        }
        if (streamMessageHandler[event.eventType]) {
            streamMessageHandler[event.eventType](this.state[streamName], event);
        }
    }
}
