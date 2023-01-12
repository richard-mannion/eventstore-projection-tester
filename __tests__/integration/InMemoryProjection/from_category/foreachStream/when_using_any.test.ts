import { StreamCollection, Metadata, Event, emitFunction, linkToFunction } from '../../../../../src';
import { InMemoryForeachCategoryAction } from '../../../../../src/InMemoryForeachStreamCategoryAction';
import { InMemoryProjection } from '../../../../../src/InMemoryProjection';

describe('when processing events with a projection', () => {
    describe('when using fromCategory', () => {
        describe('when the projection uses foreachStream', () => {
            describe('when there is one projection that uses $any and state', () => {
                it('should update the state', async () => {
                    const funct = (emit: emitFunction, linkTo: linkToFunction) => {
                        return {
                            $init: () => {
                                return { eventsProcessed: 0 };
                            },
                            $any: (s: any, e: any) => {
                                s.eventsProcessed += 1;
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

                    streamsCollection['my_stream-123'] = {
                        streamId: 'my_stream-123',
                        events: [eventToProcess, eventToProcess2],
                    };

                    const projection = new InMemoryProjection(streamsCollection);
                    projection.fromCategory('my_stream').foreachStream().when(funct(emitFunction, linkToFunction));
                    projection.fromCategory('my_stream').foreachStream().when(funct(emitFunction, linkToFunction));
                    const actualState = (
                        projection.fromCategory('my_stream').foreachStream() as InMemoryForeachCategoryAction
                    ).state;
                    const expectedState = {
                        'my_stream-123': { eventsProcessed: 2 },
                    };
                    expect(actualState).toEqual(expectedState);
                });
            });
        });
    });
});
