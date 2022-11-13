import {
    InMemoryEventstoreEngine,
    StreamCollection,
    Metadata,
    Event,
    emitFunction,
    linkToFunction,
} from '../../../../../src';
import { InMemoryProjection } from '../../../../../src/InMemoryProjection';
import { runEventstoreEngine } from '../../../../../src/runEventstoreEngine';
import { funct } from './basicEmitProjection.js';

/*const myLoggerFunction = (streamName: string, eventType: string, data: any, metadata: Metadata): void => {
    console.log('%^%^%^%^%^%^%^%%^%^');
};*/
const linkToFunc: linkToFunction = (streamId: string, event: Event, metadata: Metadata) => {};
describe('when processing events with a projection', () => {
    describe('when using fromCaegory', () => {
        describe('when there is one projection that emits events', () => {
            describe('when the stream does not match nd the event does', () => {
                it('should emit one event', async () => {
                    const emitFunction: emitFunction = jest.fn().mockName('emit');
                    const linkToMockFunc: linkToFunction = jest.fn().mockName('linkTo');

                    const streamsCollection: StreamCollection = {};
                    const eventToProcess = {
                        data: 'my event',
                        eventType: 'myEventType',
                        metadata: null,
                        created: 1,
                    };
                    const eventToIgnore = {
                        data: 'my event2',
                        eventType: 'myOtherEventType',
                        metadata: null,
                        created: 2,
                    };

                    streamsCollection.my_non_matching_stream = {
                        streamId: 'my_non_matching_stream',
                        events: [eventToProcess, eventToIgnore],
                    };

                    const projection = new InMemoryProjection(streamsCollection);
                    projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunc));
                    projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunc));

                    expect(emitFunction).toBeCalledTimes(0);
                    expect(linkToMockFunc).toBeCalledTimes(0);
                });
            });
        });
    });
});
