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
import { funct } from './basicLinkToProjection.js';

/*const myLoggerFunction = (streamName: string, eventType: string, data: any, metadata: Metadata): void => {
    console.log('%^%^%^%^%^%^%^%%^%^');
};*/
describe('when processing events with a projection', () => {
    describe('when there is one projections that emits events', () => {
        describe('when the projection uses fromCategory', () => {
            describe('when there is only one stream', () => {
                describe('when only one of two events matches', () => {
                    it('should emit one event', async () => {
                        const emitFunction: emitFunction = jest.fn().mockName('emit');
                        const linkToFunction: linkToFunction = jest.fn().mockName('linkTo');

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

                        streamsCollection['my_stream-123'] = {
                            streamId: 'my_stream-123',
                            events: [eventToProcess, eventToIgnore],
                        };

                        const projection = new InMemoryProjection(streamsCollection);
                        projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunction));
                        projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunction));

                        expect(emitFunction).toBeCalledTimes(0);
                        expect(linkToFunction).toBeCalledTimes(1);
                    });

                    it('the source event should be passed into the linkTo function', async () => {
                        let passedInEvent: Event = { data: '', eventType: '', metadata: { EventId: 1 }, EventId: 1 };
                        const eventToProcess = {
                            data: { myEventDataField: 'my event' },
                            eventType: 'myEventType',
                            metadata: null,
                            EventId: 1,
                        };
                        const emitFunction: emitFunction = jest.fn().mockName('emit');
                        const linkToFunction: linkToFunction = (streamId: string, event: Event, metadata: Metadata) => {
                            passedInEvent = event;
                        };

                        const streamsCollection: StreamCollection = {};

                        const eventToIgnore = {
                            data: 'my event2',
                            eventType: 'myOtherEventType',
                            metadata: null,
                            EventId: 2,
                        };

                        streamsCollection['my_stream-123'] = {
                            streamId: 'my_stream-123',
                            events: [eventToProcess, eventToIgnore],
                        };

                        const projection = new InMemoryProjection(streamsCollection);
                        projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunction));
                        projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunction));

                        expect(passedInEvent).toBe(eventToProcess);
                    });

                    it('the source event should be passed into the linkTo function', async () => {
                        const emitFunction: emitFunction = jest.fn().mockName('emit');
                        let passedInEvent: Event = { data: '', eventType: '', metadata: {}, EventId: 0 };
                        const eventToProcess = {
                            data: { myEventDataField: 'my event' },
                            eventType: 'myEventType',
                            metadata: null,
                            EventId: 1,
                        };
                        const linkToFunction: linkToFunction = (streamId: string, event: Event, metadata: Metadata) => {
                            passedInEvent = event;
                        };

                        const streamsCollection: StreamCollection = {};

                        const eventToIgnore = {
                            data: 'my event2',
                            eventType: 'myOtherEventType',
                            metadata: null,
                            EventId: 2,
                        };

                        streamsCollection['my_stream-123'] = {
                            streamId: 'my_stream-123',
                            events: [eventToProcess, eventToIgnore],
                        };

                        const projection = new InMemoryProjection(streamsCollection);
                        projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunction));
                        projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunction));

                        expect(passedInEvent).toBe(eventToProcess);
                    });
                    it('the new metadata should be passed in', async () => {
                        let passedInMetadata: Metadata = {};
                        const eventToProcess = {
                            data: { myEventDataField: 'my event' },
                            eventType: 'myEventType',
                            metadata: null,
                            EventId: 1,
                        };
                        const emitFunction: emitFunction = jest.fn().mockName('emit');
                        const linkToFunction: linkToFunction = (streamId: string, event: Event, metadata: Metadata) => {
                            passedInMetadata = metadata;
                        };

                        const streamsCollection: StreamCollection = {};

                        const eventToIgnore = {
                            data: 'my event2',
                            eventType: 'myOtherEventType',
                            metadata: null,
                            EventId: 2,
                        };

                        streamsCollection['my_stream-123'] = {
                            streamId: 'my_stream-123',
                            events: [eventToProcess, eventToIgnore],
                        };

                        const projection = new InMemoryProjection(streamsCollection);
                        projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunction));
                        projection.fromCategory('my_stream').when(funct(emitFunction, linkToFunction));

                        expect(JSON.stringify(passedInMetadata)).toBe(JSON.stringify({ EventId: 1 }));
                    });
                });
            });
        });
    });
});
