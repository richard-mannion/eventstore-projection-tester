import {
    InMemoryEventstoreEngine,
    InMemoryProjection,
    StreamCollection,
    Metadata,
    Event,
    emitFunction,
    linkToFunction,
} from '../../../../../src';
import { runEventstoreEngine } from '../../../../../src/runEventstoreEngine';
import { funct } from './basicEmitProjection.js';

describe('when processing events with a projection', () => {
    describe('when using fromStream', () => {
        describe('when all events have already been processed', () => {
            it('should not process events', async () => {
                const emitFunc: emitFunction = jest.fn().mockName('emit');
                const linkToFunc: linkToFunction = jest.fn().mockName('linkTo');
                await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    const streamsCollection: StreamCollection = {};
                    const eventToProcess = { data: 'my event', eventType: 'myEventType', metadata: null };
                    const eventToIgnore = { data: 'my event2', eventType: 'myOtherEventType', metadata: null };

                    streamsCollection.my_stream = { streamId: 'my_stream', events: [eventToProcess, eventToIgnore] };

                    const projection = new InMemoryProjection(streamsCollection);
                    projection.fromStream('my_stream').when(funct(emitFunc, linkToFunc));
                    projection.fromStream('my_stream').when(funct(emitFunc, linkToFunc));
                });
                expect(emitFunc).toBeCalledTimes(1);
                expect(linkToFunc).toBeCalledTimes(0);
            });
        });
    });
});
