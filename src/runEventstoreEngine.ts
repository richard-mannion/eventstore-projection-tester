import { EventstoreEngine, InMemoryEventstoreEngine, Event } from './EventstoreEngine';
import { getEnginePath } from './paths';
import { v4 } from 'uuid';
import { existsSync, rmSync } from 'fs';

export interface EventStoreEngineResult {
    getTotalProjections: () => number;
    getTotalEvents: () => number;
    getStreamNames: () => Array<string>;
    getEventsForStream: (streamName: string) => Array<Event>;
    getEvents: () => Array<Event>;
}

export class InMemoryEventStoreEngineResult {
    constructor(private engine: InMemoryEventstoreEngine) {}
    public getTotalProjections = (): number => this.engine.getTotalProjections();
    public getTotalEvents = (): number => this.engine.getTotalEvents();
    public getStreamNames = (): Array<string> => this.engine.getStreamNames();
    public getEventsForStream = (streamName: string): Array<Event> => this.engine.getEventsForStream(streamName);
    public getEvents = (): Array<Event> => this.engine.getEvents();
}

export const runEventstoreEngine = async (
    clientCode: (eventstoreEngine: EventstoreEngine) => Promise<void>,
): Promise<EventStoreEngineResult> => {
    const engineId = v4();
    const enginePath = getEnginePath(__dirname, engineId);

    try {
        const engine = new InMemoryEventstoreEngine(enginePath);
        await clientCode(engine);
        return new InMemoryEventStoreEngineResult(engine);
    } finally {
        if (existsSync(enginePath)) {
            rmSync(enginePath, { recursive: true });
        }
    }
};
