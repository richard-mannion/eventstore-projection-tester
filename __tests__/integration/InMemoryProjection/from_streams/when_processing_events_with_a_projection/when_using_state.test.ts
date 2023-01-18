import { StreamCollection, Metadata, Event, emitFunction, linkToFunction } from '../../../../../src';
import { InMemoryProjection } from '../../../../../src/InMemoryProjection';

describe('when processing events with a projection', () => {
    describe('when using fromStreams', () => {
        describe('when there is one projection that uses state', () => {
            it('should update the state', async () => {
                let state = {};
                const funct = (emit: emitFunction, linkTo: linkToFunction) => {
                    return {
                        $init: () => {
                            return { eventsProcessed: 0 };
                        },
                        myEventType: (s: any, e: any) => {
                            s.eventsProcessed += 1;
                            state = s;
                        },
                    };
                };

                const emitFunction: emitFunction = jest.fn().mockName('emit');
                const linkToFunction: linkToFunction = jest.fn().mockName('linkTo');
                const streamsCollection: StreamCollection = {};
                const eventToProcess = {
                    data: 'my event',
                    eventType: 'myEventType',
                    metadata: null,
                    EventId: 1,
                };
                const eventToProcess2 = {
                    data: 'my event2',
                    eventType: 'myEventType',
                    metadata: null,
                    EventId: 2,
                };

                streamsCollection.my_stream = {
                    streamId: 'my_stream',
                    events: [eventToProcess],
                };
                streamsCollection.my_stream_2 = {
                    streamId: 'my_stream_2',
                    events: [eventToProcess2],
                };

                const projection = new InMemoryProjection(streamsCollection);
                projection.fromStreams(['my_stream', 'my_stream_2']).when(funct(emitFunction, linkToFunction));
                projection.fromStreams(['my_stream', 'my_stream_2']).when(funct(emitFunction, linkToFunction));

                expect(state).toEqual({ eventsProcessed: 2 });
            });
        });
    });
});
