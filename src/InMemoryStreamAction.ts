import { Stream, StreamAction, StreamMessageHandler, StreamPointer } from './EventstoreEngine';
import { getNextStreamPointer } from './getNextStreamPointer';

export class InMemoryStreamAction implements StreamAction {
    private state: any;
    public streamPointer: StreamPointer = 'START';
    public constructor(private stream: Stream) {}
    public when(streamMessageHandler: StreamMessageHandler) {
        if (!this.state && streamMessageHandler.$init) {
            this.state = streamMessageHandler.$init();
        }

        const nextStreamPointer = getNextStreamPointer(this.stream, this.streamPointer);

        if (nextStreamPointer === undefined) {
            return;
        }

        const event = this.stream.events[nextStreamPointer];
        this.streamPointer = nextStreamPointer;

        if (streamMessageHandler['$all']) {
            streamMessageHandler['$all'](this.state, event);
        }
        if (streamMessageHandler[event.eventType]) {
            streamMessageHandler[event.eventType](this.state, event);
        }
    }
}
