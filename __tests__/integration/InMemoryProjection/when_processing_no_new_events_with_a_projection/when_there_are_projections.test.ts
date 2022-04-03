import { InMemoryEventstoreEngine, InMemoryProjection, streamCollection, Metadata, Event } from '../../../../src';
import { runEventstoreEngine } from '../../../../src/runEventstoreEngine';
import { funct } from './basicEmitProjection.js';

/*const myLoggerFunction = (streamName: string, eventType: string, data: any, metadata: Metadata): void => {
    console.log('%^%^%^%^%^%^%^%%^%^');
};*/

describe('when processing events with a projection', () => {
    describe('when all events have already been processed', () => {
        it('should no process events', async () => {
            const emitFunc: (streamName: string, eventType: string, data: any, metadata: Metadata) => void = jest
                .fn()
                .mockName('emit');
            await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                const streamsCollection: streamCollection = {};
                const eventToProcess = { data: 'my event', type: 'myEventType', metadata: null };
                const eventToIgnore = { data: 'my event2', type: 'myOtherEventType', metadata: null };

                streamsCollection.my_stream = { streamName: 'my_stream', events: [eventToProcess, eventToIgnore] };

                const projection = new InMemoryProjection(streamsCollection);
                projection.fromStream('my_stream').when(funct(emitFunc));
                projection.fromStream('my_stream').when(funct(emitFunc));
            });
            expect(emitFunc).toBeCalledTimes(1);
        });
    });
});
