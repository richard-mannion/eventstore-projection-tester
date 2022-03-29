import { InMemoryEventstoreEngine, InMemoryProjection, streamCollection, Metadata, Event } from '../../../../src';
import { runEventstoreEngine } from '../../../../src/runEventstoreEngine';
import { funct } from './basicEmitProjection.js';

/*const myLoggerFunction = (streamName: string, eventType: string, data: any, metadata: Metadata): void => {
    console.log('%^%^%^%^%^%^%^%%^%^');
};*/

describe('when processing events with a projection', () => {
    describe('when there is one projections that emits events', () => {
        describe('when only one of two events matches', () => {
            it('should emit one event', async () => {
                const emitFunc: (streamName: string, eventType: string, data: any, metadata: Metadata) => void = jest
                    .fn()
                    .mockName('emit');
                await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    const streamsCollection: streamCollection = {};
                    const eventToProcess = { data: 'my event', type: 'myEventType', metadata: null };
                    const eventToIgnore = { data: 'my event2', type: 'myOtherEventType', metadata: null };

                    streamsCollection.my_stream = { streamName: 'my_stream', events: [eventToProcess, eventToIgnore] };

                    const projection = new InMemoryProjection(streamsCollection, emitFunc);
                    projection.fromstream('my_stream').when(funct(emitFunc, engine));
                    engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);
                });
                expect(emitFunc).toBeCalledTimes(1);
            });

            it('the emitted event should be of the type specified in the emit action', async () => {
                let emittedEventType = '';
                const emitFunc = (_streamName: string, eventType: string, _data: any, _metadata: Metadata) => {
                    emittedEventType = eventType;
                };
                await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    const streamsCollection: streamCollection = {};
                    const eventToProcess = {
                        data: { myEventDataField: 'my event' },
                        type: 'myEventType',
                        metadata: null,
                    };
                    const eventToIgnore = { data: 'my event2', type: 'myOtherEventType', metadata: null };

                    streamsCollection.my_stream = { streamName: 'my_stream', events: [eventToProcess, eventToIgnore] };

                    const projection = new InMemoryProjection(streamsCollection, emitFunc);
                    projection.fromstream('my_stream').when(funct(emitFunc, engine));
                    engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);
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
                    const streamsCollection: streamCollection = {};

                    const eventToProcess = { data: inputData, type: 'myEventType', metadata: null };
                    const eventToIgnore = { data: 'my event2', type: 'myOtherEventType', metadata: null };

                    streamsCollection.my_stream = { streamName: 'my_stream', events: [eventToProcess, eventToIgnore] };

                    const projection = new InMemoryProjection(streamsCollection, emitFunc);
                    projection.fromstream('my_stream').when(funct(emitFunc, engine));
                    engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);
                });
                expect(JSON.stringify(emittedData)).toBe(JSON.stringify(inputData));
            });
            describe('when There is no metatdata', () => {
                it('the emitted metadata should be empty', async () => {
                    let emittedMetadata;
                    const emitFunc = (_streamName: string, _eventType: string, _data: any, metadata: Metadata) => {
                        emittedMetadata = metadata;
                    };
                    await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                        const streamsCollection: streamCollection = {};
                        const eventToProcess = {
                            data: { myEventDataField: 'my event' },
                            type: 'myEventType',
                            metadata: null,
                        };
                        const eventToIgnore = { data: 'my event2', type: 'myOtherEventType', metadata: null };

                        streamsCollection.my_stream = {
                            streamName: 'my_stream',
                            events: [eventToProcess, eventToIgnore],
                        };

                        const projection = new InMemoryProjection(streamsCollection, emitFunc);
                        projection.fromstream('my_stream').when(funct(emitFunc, engine));
                        engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);
                    });

                    expect(emittedMetadata).toBeNull();
                });
            });
            describe('when There is metatdata', () => {
                it('the emitted metadata should be set', async () => {
                    let emittedMetadata;
                    const inputMetadata = { myMetadataField: 'my metadata' };
                    const emitFunc = (_streamName: string, _eventType: string, _data: any, metadata: Metadata) => {
                        emittedMetadata = metadata;
                    };
                    await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                        const streamsCollection: streamCollection = {};
                        const eventToProcess = {
                            data: { myEventDataField: 'my event' },
                            type: 'myEventType',
                            metadata: inputMetadata,
                        };
                        const eventToIgnore = { data: 'my event2', type: 'myOtherEventType', metadata: null };

                        streamsCollection.my_stream = {
                            streamName: 'my_stream',
                            events: [eventToProcess, eventToIgnore],
                        };

                        const projection = new InMemoryProjection(streamsCollection, emitFunc);
                        projection.fromstream('my_stream').when(funct(emitFunc, engine));
                        engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);
                    });
                    expect(JSON.stringify(emittedMetadata)).toBe(JSON.stringify(inputMetadata));
                });
            });
        });
    });
});
