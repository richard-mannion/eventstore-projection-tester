import { InMemoryEventstoreEngine, StreamCollection, emitFunction, linkToFunction } from '../../../../../src';
import { InMemoryProjection } from '../../../../../src/InMemoryProjection';
import { runEventstoreEngine } from '../../../../../src/runEventstoreEngine';
import { funct } from './basicEmitProjection.js';

describe('when processing events with a projection', () => {
    describe('when using fromStream', () => {
        describe('when all events have already been processed', () => {
            it('should not process events', async () => {
                const emitFunc: emitFunction = jest.fn().mockName('emit');
                const linkToFunc: linkToFunction = jest.fn().mockName('linkTo');

                const streamsCollection: StreamCollection = {};
                const eventToProcess = { data: 'my event', eventType: 'myEventType', metadata: null, created: 1 };

                streamsCollection['my_stream-123'] = {
                    streamId: 'my_stream-123',
                    events: [eventToProcess],
                };

                const projection = new InMemoryProjection(streamsCollection);
                projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));

                expect(emitFunc).toBeCalledTimes(1);
                expect(linkToFunc).toBeCalledTimes(0);
            });
        });
    });
});
