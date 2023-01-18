import { StreamCollection, Metadata, Event, emitFunction, linkToFunction } from '../../../../../src';
import { InMemoryProjection } from '../../../../../src/InMemoryProjection';
import { funct } from './basicEmitProjection.js';

/*const myLoggerFunction = (streamName: string, eventType: string, data: any, metadata: Metadata): void => {
    console.log('%^%^%^%^%^%^%^%%^%^');
};*/
const linkToFunc: linkToFunction = (streamId: string, event: Event, metadata: Metadata) => {};
describe('when processing events with a projection', () => {
    describe('when using fromStreams', () => {
        describe('when there is one projections that emits events', () => {
            describe('when the event matches the first stream name', () => {
                it('should emit one event', async () => {
                    const emitFunction: emitFunction = jest.fn().mockName('emit');
                    const linkToMockFunc: linkToFunction = jest.fn().mockName('linkTo');

                    const streamsCollection: StreamCollection = {};
                    const eventToProcess = {
                        data: 'my event',
                        eventType: 'myEventType',
                        metadata: null,
                        EventId: 1,
                    };

                    streamsCollection.my_stream2 = {
                        streamId: 'my_stream2',
                        events: [eventToProcess],
                    };

                    const projection = new InMemoryProjection(streamsCollection);
                    projection.fromStreams(['my_stream2', 'my_stream']).when(funct(emitFunction, linkToFunc));
                    projection.fromStreams(['my_stream2', 'my_stream']).when(funct(emitFunction, linkToFunc));
                    expect(emitFunction).toBeCalledTimes(1);
                    expect(linkToMockFunc).toBeCalledTimes(0);
                });
            });
            describe('when the event matches the second stream name', () => {
                it('should emit one event', async () => {
                    const emitFunction: emitFunction = jest.fn().mockName('emit');
                    const linkToMockFunc: linkToFunction = jest.fn().mockName('linkTo');

                    const streamsCollection: StreamCollection = {};
                    const eventToProcess = {
                        data: 'my event',
                        eventType: 'myEventType',
                        metadata: null,
                        EventId: 1,
                    };

                    streamsCollection.my_stream = {
                        streamId: 'my_stream',
                        events: [eventToProcess],
                    };

                    const projection = new InMemoryProjection(streamsCollection);
                    projection.fromStreams(['my_stream2', 'my_stream']).when(funct(emitFunction, linkToFunc));
                    projection.fromStreams(['my_stream2', 'my_stream']).when(funct(emitFunction, linkToFunc));
                    expect(emitFunction).toBeCalledTimes(1);
                    expect(linkToMockFunc).toBeCalledTimes(0);
                });
            });
            describe('when the event matches no streams', () => {
                it('should emit no event', async () => {
                    const emitFunction: emitFunction = jest.fn().mockName('emit');
                    const linkToMockFunc: linkToFunction = jest.fn().mockName('linkTo');

                    const streamsCollection: StreamCollection = {};
                    const eventToProcess = {
                        data: 'my event',
                        eventType: 'myEventType',
                        metadata: null,
                        EventId: 1,
                    };
                    const eventToIgnore = {
                        data: 'my event2',
                        eventType: 'myOtherEventType',
                        metadata: null,
                        EventId: 2,
                    };

                    streamsCollection.my_stream_3 = {
                        streamId: 'my_stream_3',
                        events: [eventToProcess, eventToIgnore],
                    };

                    const projection = new InMemoryProjection(streamsCollection);
                    projection.fromStreams(['my_stream2', 'my_stream']).when(funct(emitFunction, linkToFunc));
                    projection.fromStreams(['my_stream2', 'my_stream']).when(funct(emitFunction, linkToFunc));
                    expect(emitFunction).toBeCalledTimes(0);
                    expect(linkToMockFunc).toBeCalledTimes(0);
                });
            });
        });
    });
});
