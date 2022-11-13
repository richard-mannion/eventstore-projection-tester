import { Stream, StreamAction, StreamMessageHandler, StreamPointer } from './EventstoreEngine';

export class InMemoryStreamAction implements StreamAction {
    private state: any;
    public streamPointer: StreamPointer = 'START';
    public constructor(private stream: Stream) {}
    public when(streamMessageHandler: StreamMessageHandler) {
        if (!this.state && streamMessageHandler.$init) {
            this.state = streamMessageHandler.$init();
        }
        if (this.stream.events.length == 0) {
            return;
        }
        if (this.streamPointer === this.stream.events.length - 1) {
            return;
        }
        const nextStreamPointer = this.streamPointer === 'START' ? 0 : this.streamPointer + 1;
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
