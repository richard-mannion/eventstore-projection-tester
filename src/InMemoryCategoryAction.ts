import {
    CategoryAction,
    StreamCollection,
    StreamMessageHandler,
    StreamPointerCollection,
    ForeachStreamCategoryAction,
} from './EventstoreEngine';
import { getNextEventStream } from './getNextEventStream';
import { InMemoryForeachCategoryAction } from './InMemoryForeachStreamCategoryAction';

export class InMemoryCategoryAction implements CategoryAction {
    private state: any;
    public streamPointers: StreamPointerCollection;
    private foreachStreamCategoryAction: ForeachStreamCategoryAction;
    public constructor(private getStreams: () => StreamCollection) {
        this.streamPointers = {};
        this.foreachStreamCategoryAction = new InMemoryForeachCategoryAction(getStreams);
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
        //console.log(streamMessageHandler);
        if (streamMessageHandler['$any']) {
            streamMessageHandler['$any'](this.state, event);
        }
        if (streamMessageHandler[event.eventType]) {
            streamMessageHandler[event.eventType](this.state, event);
        }
    }

    public foreachStream(): ForeachStreamCategoryAction {
        return this.foreachStreamCategoryAction;
    }
}
