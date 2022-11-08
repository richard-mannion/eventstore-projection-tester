import { makeExecutableProjection } from './makeExecutableProjection';
import { getProjectionFilePath } from './paths';
import { FakeDateTime } from './FakeDateTime';

export interface StreamMessageHandler {
    $init: () => any | null;
    [key: string]: (s: any, e: Event) => void;
}

export interface StreamAction {
    when(streamMessageHandler: StreamMessageHandler): void;
}

export interface CategoryAction {
    when(categoryMessageHandler: StreamMessageHandler): void;
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
    fromStream: fromStreamFunction;
    //fromCategory: fromCategoryFunction;
}

export interface Stream {
    streamId: string;
    events: Array<Event>;
}

export type StreamPointer = number | 'START';
export type Metadata = Record<string | number, unknown> | unknown[] | string | unknown;
export type StreamCollection = { [key: string]: Stream };
export type StreamPointerCollection = { [key: string]: StreamPointer };
export type emitFunction = (streamId: string, eventType: string, data: any, metadata: Metadata) => void;
export type linkToFunction = (streamId: string, event: Event, metadata: Metadata) => void;
export type fromStreamFunction = (streamName: string) => StreamAction;
export type fromCategoryFunction = (categoryName: string) => StreamAction;
export interface Event {
    data: any;
    eventType: string;
    metadata: Metadata;
    created: number;
}

export type projectionExecutor = (emit: emitFunction, linkTo: linkToFunction, fromStream: fromStreamFunction) => void;
export type projectionContainer = { projection: Projection; execute: projectionExecutor };

export class NoStreamAction implements StreamAction {
    when(_streamMessageHandler: StreamMessageHandler): void {}
}

export const getStreamNamesFromCategoryName = (streamNames: Array<string>, categoryName: string): Array<string> => {
    const category = `${categoryName}-`;
    return streamNames.filter((streamName) => streamName.startsWith(category));
};

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

                if (!oldestEvent || oldestEvent.created < event.created) {
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

export class InMemoryProjection implements Projection {
    public streamAction: StreamAction | CategoryAction | undefined;
    constructor(private streams: StreamCollection) {}
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

    public fromCategory = (categoryName: string): CategoryAction => {
        const getStreamNames = (): StreamCollection => {
            const streamNames = Object.keys(this.streams);
            const matchingStreamNames = getStreamNamesFromCategoryName(streamNames, categoryName);
            let streamCollection: StreamCollection = {};
            matchingStreamNames.forEach((key) => {
                streamCollection[key] = this.streams[key];
            });
            return streamCollection;
        };

        //const stream = this.streams[streamName];
        /*if (!stream) {
            return new NoStreamAction();
        }*/
        if (!this.streamAction) {
            this.streamAction = new InMemoryCategoryAction(getStreamNames);
        }
        return this.streamAction;
    };
}

export class InMemoryEventstoreEngine implements EventstoreEngine {
    private streams: StreamCollection;
    private projections: Array<projectionContainer>;
    private fakeDateTime: FakeDateTime;
    public constructor(private tempPath: string) {
        this.streams = {};
        this.projections = [];
        this.fakeDateTime = new FakeDateTime();
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
        const created = this.fakeDateTime.getNextTime();
        const event = { data, eventType: eventType, metadata, created };
        if (currentStream) {
            currentStream.events.push(event);
        } else {
            this.streams[streamId] = { events: [event], streamId: streamId };
        }
        this.projections.forEach((projectionContainer) => {
            projectionContainer.execute(this.emit, this.linkTo, projectionContainer.projection.fromStream);
        });
    };
    public linkTo = (streamId: string, event: Event, metadata: Metadata) => {
        const currentStream = this.streams[streamId];
        const created = this.fakeDateTime.getNextTime();
        const linkedEvent = { data: event.data, eventType: event.eventType, metadata, created };

        if (currentStream) {
            currentStream.events.push(linkedEvent);
        } else {
            this.streams[streamId] = { events: [linkedEvent], streamId: streamId };
        }
        this.projections.forEach((projectionContainer) => {
            projectionContainer.execute(this.emit, this.linkTo, projectionContainer.projection.fromStream);
        });
    };
}
