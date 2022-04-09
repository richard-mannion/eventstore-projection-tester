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
    getEvents(): Array<Event>;
    CleanTempFiles(): void;
}

export interface Projection {
    fromStream(streamName: string): StreamAction;
}

export interface Stream {
    streamId: string;
    events: Array<Event>;
}

export type Metadata = Record<string | number, unknown> | unknown[] | string | unknown;
export type streamCollection = { [key: string]: Stream };
export type emitFunction = (streamId: string, eventType: string, data: any, metadata: Metadata) => void;
export type linkToFunction = (streamId: string, event: Event, metadata: Metadata) => void;
export interface Event {
    data: any;
    eventType: string;
    metadata: Metadata;
}

export type projectionExecutor = (projection: Projection, emit: emitFunction, linkTo: linkToFunction) => void;
export type projectionContainer = { projection: Projection; execute: projectionExecutor };

export class NoStreamAction implements StreamAction {
    when(_streamMessageHandler: StreamMessageHandler): void {}
}

export class InMemoryStreamAction implements StreamAction {
    private state: any;
    public streamPointer: number | 'START' = 'START';
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

        if (streamMessageHandler[event.eventType]) {
            streamMessageHandler[event.eventType](this.state, event);
        }
    }
}

export class InMemoryProjection implements Projection {
    public streamAction: StreamAction | undefined;
    constructor(private streams: streamCollection) {}
    public fromStream = (streamName: string): StreamAction => {
        const stream = this.streams[streamName];
        if (!stream) {
            return new NoStreamAction();
        }
        if (!this.streamAction) {
            this.streamAction = new InMemoryStreamAction(stream);
        }
        return this.streamAction;
    };
}

export class InMemoryEventstoreEngine implements EventstoreEngine {
    private streams: streamCollection;
    private projections: Array<projectionContainer>;
    public constructor(private tempPath: string) {
        this.streams = {};
        this.projections = [];
    }
    public addProjection = async (projectionName: string, projection: string) => {
        makeExecutableProjection(this.tempPath, projectionName, projection);
        const { executableProjection } = await import(getProjectionFilePath(this.tempPath, projectionName));
        const inMemoryProjection = new InMemoryProjection(this.streams);
        this.projections.push({ projection: inMemoryProjection, execute: executableProjection });
    };
    public CleanTempFiles = (): void => {};
    public addEvent = (streamId: string, eventType: string, data: any, metadata: Metadata) => {
        this.emit(streamId, eventType, data, metadata);
    };

    public getTotalEvents = (): number => {
        const streamKeys = Object.keys(this.streams);
        return streamKeys.reduce((partialSum, key) => partialSum + this.streams[key].events.length, 0);
    };

    public getEvents = (): Event[] => {
        const streamKeys = Object.keys(this.streams);
        let events = Array<Event>();
        streamKeys.forEach((key) => events.push(...this.streams[key].events));
        return events;
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
        return this.streams[streamName].events;
    };

    public emit = (streamId: string, eventType: string, data: any, metadata: Metadata) => {
        const currentStream = this.streams[streamId];
        const event = { data, eventType: eventType, metadata };

        if (currentStream) {
            currentStream.events.push(event);
        } else {
            this.streams[streamId] = { events: [event], streamId: streamId };
        }
        this.projections.forEach((projectionContainer) => {
            projectionContainer.execute(projectionContainer.projection, this.emit, this.linkTo);
        });
    };
    public linkTo = (streamId: string, event: Event, metadata: Metadata) => {
        const currentStream = this.streams[streamId];
        const linkedEvent = { data: event.data, eventType: event.eventType, metadata };

        if (currentStream) {
            currentStream.events.push(linkedEvent);
        } else {
            this.streams[streamId] = { events: [linkedEvent], streamId: streamId };
        }
        this.projections.forEach((projectionContainer) => {
            projectionContainer.execute(projectionContainer.projection, this.emit, this.linkTo);
        });
    };
}
