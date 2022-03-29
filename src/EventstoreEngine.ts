import { makeExecutableProjection } from './makeExecutableProjection';
import { getProjectionFilePath } from './paths';

export interface StreamMessageHandler {
    $init: () => any | null;
    [key: string]: (s: any, e: Event) => void;
}

export interface StreamAction {
    when(streamMessageHandler: StreamMessageHandler): void;
}

export interface EventstoreEngine {
    addProjection(projectionName: string, projection: string): Promise<void>;
    getTotalProjections(): number;
    getTotalEvents(): number;
    getStreamNames(): Array<string>;
    getEventsForStream(streamName: string): Array<Event>;
    CleanTempFiles(): void;
}

export interface Projection {
    fromstream(streamName: string): StreamAction;
}

export interface Stream {
    streamName: string;
    events: Array<Event>;
}

export type Metadata = Record<string | number, unknown> | unknown[] | string | unknown;
export type streamCollection = { [key: string]: Stream };
export type emitFunction = (streamName: string, eventType: string, data: any, metadata: Metadata) => void;
export interface Event {
    data: any;
    type: string;
    metadata: Metadata;
}

export type projectionExecutor = (eventstoreEngine: EventstoreEngine, emit: emitFunction) => void;

export class NoStreamAction implements StreamAction {
    when(_streamMessageHandler: StreamMessageHandler): void {}
}

export class InMemoryStreamAction implements StreamAction {
    private state: any;
    private streamPointer: number | 'START' = 'START';
    public constructor(private stream: Stream, private emit: emitFunction) {}
    public when(streamMessageHandler: StreamMessageHandler) {
        if (!this.state && streamMessageHandler.$init) {
            this.state = streamMessageHandler.$init();
        }

        const nextStreamPointer = this.streamPointer == 'START' ? 0 : this.streamPointer++;

        const event = this.stream.events[nextStreamPointer];

        if (streamMessageHandler[event.type]) {
            streamMessageHandler[event.type](this.state, event);
        }
        this.streamPointer = nextStreamPointer;
    }
}

export class InMemoryProjection implements Projection {
    private streamAction: StreamAction | undefined;
    constructor(private streams: streamCollection, private emit: emitFunction) {}
    public fromstream = (streamName: string): StreamAction => {
        const stream = this.streams[streamName];
        if (!stream) {
            return new NoStreamAction();
        }
        if (!this.streamAction) {
            this.streamAction = new InMemoryStreamAction(stream, this.emit);
        }
        return this.streamAction;
    };
}

export class InMemoryEventstoreEngine implements EventstoreEngine {
    private streams: streamCollection;
    private projections: Array<projectionExecutor>;
    public constructor(private tempPath: string) {
        this.streams = {};
        this.projections = [];
    }
    public addProjection = async (projectionName: string, projection: string) => {
        makeExecutableProjection(this.tempPath, projectionName, projection);
        const executableProjection: projectionExecutor = await import(
            getProjectionFilePath(this.tempPath, projectionName)
        );
        this.projections.push(executableProjection);
    };
    public CleanTempFiles = (): void => {};
    public addEvent = (streamName: string, eventType: string, data: any, metadata: Metadata) => {
        this.emit(streamName, eventType, data, metadata);
    };

    public getTotalEvents = (): number => {
        const streamKeys = Object.keys(this.streams);
        return streamKeys.reduce((partialSum, key) => partialSum + this.streams[key].events.length, 0);
    };

    public getTotalProjections = (): number => {
        return this.projections.length;
    };

    public getStreamNames = (): Array<string> => {
        return Object.keys(this.streams);
    };

    public getEventsForStream = (streamName: string): Array<Event> => {
        const stream = this.streams[streamName];
        if (!stream) {
            return [];
        }
        return JSON.parse(JSON.stringify(this.streams[streamName].events));
    };

    public emit = (streamName: string, eventType: string, data: any, metadata: Metadata) => {
        const curentStream = this.streams[streamName];
        const event = { data, type: eventType, metadata };

        if (curentStream) {
            curentStream.events.push(event);
            return;
        }

        this.streams[streamName] = { events: [event], streamName };
        this.projections.forEach((projection) => {
            projection(this, this.emit);
        });
    };
}
