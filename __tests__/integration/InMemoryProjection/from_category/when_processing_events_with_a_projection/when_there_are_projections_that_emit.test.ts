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

/*const myLoggerFunction = (streamName: string, eventType: string, data: any, metadata: Metadata): void => {
    console.log('%^%^%^%^%^%^%^%%^%^');
};*/
const linkToFunc: linkToFunction = (streamId: string, event: Event, metadata: Metadata) => {};
describe('when processing events with a projection', () => {
    describe('when there is one projections that emits events', () => {
        describe('when the projection uses fromCategory', () => {
            describe('when there is only one stream', () => {
                describe('when only one of two events matches', () => {
                    it('should emit one event', async () => {
                        const emitFunction: emitFunction = jest.fn().mockName('emit');
                        const linkToMockFunc: linkToFunction = jest.fn().mockName('linkTo');
                        await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
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

                            streamsCollection['my_stream-123'] = {
                                streamId: 'my_stream-123',
                                events: [eventToProcess, eventToIgnore],
                            };

                            const projection = new InMemoryProjection(streamsCollection);
                            projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunc));
                            projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunc));
                        });
                        expect(emitFunction).toBeCalledTimes(1);
                        expect(linkToMockFunc).toBeCalledTimes(0);
                    });

                    it('the emitted event should be of the type specified in the emit action', async () => {
                        let emittedEventType = '';
                        const emitFunc = (_streamName: string, eventType: string, _data: any, _metadata: Metadata) => {
                            emittedEventType = eventType;
                        };

                        await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                            const streamsCollection: StreamCollection = {};
                            const eventToProcess = {
                                data: { myEventDataField: 'my event' },
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

                            streamsCollection['my_stream-123'] = {
                                streamId: 'my_stream-123',
                                events: [eventToProcess, eventToIgnore],
                            };

                            const projection = new InMemoryProjection(streamsCollection);
                            projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                            projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                        });
                        expect(emittedEventType).toBe('NextEventType');
                    });

                    it('the emitted event should contain the specified data', async () => {
                        let emittedData = '';
                        const inputData = { myEventDataField: 'my event' };
                        const emitFunc = (_streamName: string, _eventType: string, data: any, _metadata: Metadata) => {
                            emittedData = data;
                        };
                        await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                            const streamsCollection: StreamCollection = {};
                            const eventToProcess = {
                                data: { myEventDataField: 'my event' },
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

                            streamsCollection['my_stream-123'] = {
                                streamId: 'my_stream-123',
                                events: [eventToProcess, eventToIgnore],
                            };

                            const projection = new InMemoryProjection(streamsCollection);
                            projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                            projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                        });
                        expect(JSON.stringify(emittedData)).toBe(JSON.stringify(inputData));
                    });
                    describe('when There is no metatdata', () => {
                        it('the emitted metadata should be empty', async () => {
                            let emittedMetadata;
                            const emitFunc = (
                                _streamName: string,
                                _eventType: string,
                                _data: any,
                                metadata: Metadata,
                            ) => {
                                emittedMetadata = metadata;
                            };

                            await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                                const streamsCollection: StreamCollection = {};
                                const eventToProcess = {
                                    data: { myEventDataField: 'my event' },
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

                                streamsCollection['my_stream-123'] = {
                                    streamId: 'my_stream-123',
                                    events: [eventToProcess, eventToIgnore],
                                };

                                const projection = new InMemoryProjection(streamsCollection);
                                projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                                projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                            });

                            expect(emittedMetadata).toBeNull();
                        });
                    });
                    describe('when There is metatdata', () => {
                        it('the emitted metadata should be set', async () => {
                            let emittedMetadata;
                            const inputMetadata = { myMetadataField: 'my metadata' };
                            const emitFunc = (
                                _streamName: string,
                                _eventType: string,
                                _data: any,
                                metadata: Metadata,
                            ) => {
                                emittedMetadata = metadata;
                            };

                            await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                                const streamsCollection: StreamCollection = {};
                                const eventToProcess = {
                                    data: { myEventDataField: 'my event' },
                                    eventType: 'myEventType',
                                    metadata: inputMetadata,
                                    created: 1,
                                };
                                const eventToIgnore = {
                                    data: 'my event2',
                                    eventType: 'myOtherEventType',
                                    metadata: null,
                                    created: 2,
                                };

                                streamsCollection['my_stream-123'] = {
                                    streamId: 'my_stream-123',
                                    events: [eventToProcess, eventToIgnore],
                                };

                                const projection = new InMemoryProjection(streamsCollection);
                                projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                                projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                            });
                            expect(JSON.stringify(emittedMetadata)).toBe(JSON.stringify(inputMetadata));
                        });
                    });
                });
            });
            describe('when there are two streams', () => {
                describe('when there matching events in both stream', () => {
                    it('should emit one event', async () => {
                        const emitFunction: emitFunction = jest.fn().mockName('emit');
                        const linkToMockFunc: linkToFunction = jest.fn().mockName('linkTo');
                        await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                            const streamsCollection: StreamCollection = {};
                            const eventOne = {
                                data: 'my event',
                                eventType: 'myEventType',
                                metadata: null,
                                created: 1,
                            };
                            const eventTwo = {
                                data: 'my event2',
                                eventType: 'myEventType',
                                metadata: null,
                                created: 2,
                            };

                            streamsCollection['my_stream-123'] = {
                                streamId: 'my_stream-123',
                                events: [eventOne],
                            };

                            streamsCollection['my_stream-234'] = {
                                streamId: 'my_stream-234',
                                events: [eventTwo],
                            };

                            const projection = new InMemoryProjection(streamsCollection);
                            projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunc));
                            projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunc));
                        });
                        expect(emitFunction).toBeCalledTimes(2);
                        expect(linkToMockFunc).toBeCalledTimes(0);
                    });

                    it('should emit events in chronological order', async () => {
                        let emitOrder = '';
                        const emitFunc = (_streamName: string, _eventType: string, _data: any, metadata: Metadata) => {
                            const convertedMetadata = metadata as Record<string | number, unknown>;
                            emitOrder += convertedMetadata['expected'];
                        };
                        const linkToMockFunc: linkToFunction = jest.fn().mockName('linkTo');
                        await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                            const streamsCollection: StreamCollection = {};
                            const eventOne = {
                                data: 'my event',
                                eventType: 'myEventType',
                                metadata: { expected: '1' },
                                created: 1,
                            };
                            const eventTwo = {
                                data: 'my event2',
                                eventType: 'myEventType',
                                metadata: { expected: '2' },
                                created: 2,
                            };
                            const eventThree = {
                                data: 'my event3',
                                eventType: 'myEventType',
                                metadata: { expected: '3' },
                                created: 3,
                            };

                            streamsCollection['my_stream-123'] = {
                                streamId: 'my_stream-123',
                                events: [eventTwo],
                            };

                            streamsCollection['my_stream-234'] = {
                                streamId: 'my_stream-234',
                                events: [eventOne, eventThree],
                            };

                            const projection = new InMemoryProjection(streamsCollection);
                            projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                            projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                            projection.fromCategory('my_stream').when(funct(emitFunc, linkToFunc));
                        });
                        expect(emitOrder).toBe('123');
                    });
                });
            });
        });
    });
});
