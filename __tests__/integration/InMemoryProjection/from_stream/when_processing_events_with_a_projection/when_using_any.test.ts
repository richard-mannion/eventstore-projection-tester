import { StreamCollection, Metadata, Event, emitFunction, linkToFunction } from '../../../../../src';
import { InMemoryProjection } from '../../../../../src/InMemoryProjection';

describe('when processing events with a projection', () => {
    describe('when using fromStream', () => {
        describe('when there is one projection that uses $any and state', () => {
            it('should update the state', async () => {
                let state = {};
                const funct = (emit: emitFunction, linkTo: linkToFunction) => {
                    return {
                        $init: () => {
                            return { eventsProcessed: 0 };
                        },
                        $any: (s: any, e: any) => {
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
                    created: 1,
                };
                const eventToProcess2 = {
                    data: 'my event2',
                    eventType: 'myEventType',
                    metadata: null,
                    created: 2,
                };

                streamsCollection.my_stream = {
                    streamId: 'my_stream',
                    events: [eventToProcess, eventToProcess2],
                };

                const projection = new InMemoryProjection(streamsCollection);
                projection.fromStream('my_stream').when(funct(emitFunction, linkToFunction));
                projection.fromStream('my_stream').when(funct(emitFunction, linkToFunction));

                expect(state).toEqual({ eventsProcessed: 2 });
            });
        });
    });
});
