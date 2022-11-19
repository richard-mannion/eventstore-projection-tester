import { makeExecutableProjection } from './makeExecutableProjection';
import { getProjectionFilePath } from './paths';
import { FakeDateTime } from './FakeDateTime';
import { InMemoryStreamAction } from './InMemoryStreamAction';
import { InMemoryCategoryAction } from './InMemoryCategoryAction';
import { InMemoryProjection } from './InMemoryProjection';

export interface StreamMessageHandler {
    $init: () => any | null;
    [key: string]: (s: any, e: Event) => void;
}

export interface StreamAction {
    when(streamMessageHandler: StreamMessageHandler): void;
}

export interface CategoryAction {
    when(categoryMessageHandler: StreamMessageHandler): void;
    foreachStream(): ForeachStreamCategoryAction;
}

export interface ForeachStreamCategoryAction {
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
    fromCategory: fromCategoryFunction;
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

export type projectionExecutor = (
    emit: emitFunction,
    linkTo: linkToFunction,
    fromStream: fromStreamFunction,
    fromCategory: fromCategoryFunction,
) => void;
export type projectionContainer = { projection: Projection; execute: projectionExecutor };

export class NoStreamAction implements StreamAction {
    when(_streamMessageHandler: StreamMessageHandler): void {}
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
            projectionContainer.execute(
                this.emit,
                this.linkTo,
                projectionContainer.projection.fromStream,
                projectionContainer.projection.fromCategory,
            );
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
            projectionContainer.execute(
                this.emit,
                this.linkTo,
                projectionContainer.projection.fromStream,
                projectionContainer.projection.fromCategory,
            );
        });
    };
}
