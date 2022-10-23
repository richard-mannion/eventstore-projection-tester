import {
    InMemoryEventstoreEngine,
    InMemoryProjection,
    streamCollection,
    Metadata,
    Event,
    emitFunction,
    linkToFunction,
} from '../../../../../src';
import { runEventstoreEngine } from '../../../../../src/runEventstoreEngine';
import { funct } from './basicLinkToProjection.js';

const emitFunc = (streamId: string, eventType: string, data: any, metadata: Metadata) => {};
describe('when processing events with a projection', () => {
    describe('when there is one projections that emits events via a linkTo', () => {
        describe('when only one of two events matches', () => {
            it('should emit one event', async () => {
                const emitMockFunc: emitFunction = jest.fn().mockName('emit');
                const linkToFunc: linkToFunction = jest.fn().mockName('linkTo');
                await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    const streamsCollection: streamCollection = {};
                    const eventToProcess = { data: 'my event', eventType: 'myEventType', metadata: null };
                    const eventToIgnore = { data: 'my event2', eventType: 'myOtherEventType', metadata: null };

                    streamsCollection.my_stream = { streamId: 'my_stream', events: [eventToProcess, eventToIgnore] };

                    const projection = new InMemoryProjection(streamsCollection);
                    projection.fromStream('my_stream').when(funct(emitMockFunc, linkToFunc));
                });
                expect(emitMockFunc).toBeCalledTimes(0);
                expect(linkToFunc).toBeCalledTimes(1);
            });

            it('the source event should be passed into the linkTo function', async () => {
                let passedInEvent: Event = { data: '', eventType: '', metadata: {} };
                const eventToProcess = {
                    data: { myEventDataField: 'my event' },
                    eventType: 'myEventType',
                    metadata: null,
                };
                const linkToFunc: linkToFunction = (streamId: string, event: Event, metadata: Metadata) => {
                    passedInEvent = event;
                };
                await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    const streamsCollection: streamCollection = {};

                    const eventToIgnore = { data: 'my event2', eventType: 'myOtherEventType', metadata: null };

                    streamsCollection.my_stream = { streamId: 'my_stream', events: [eventToProcess, eventToIgnore] };

                    const projection = new InMemoryProjection(streamsCollection);
                    projection.fromStream('my_stream').when(funct(emitFunc, linkToFunc));
                });
                expect(passedInEvent).toBe(eventToProcess);
            });

            it('the new metadata should be passed in', async () => {
                let passedInMetadata: Metadata = { data: '', eventType: '', metadata: {} };
                const eventToProcess = {
                    data: { myEventDataField: 'my event' },
                    eventType: 'myEventType',
                    metadata: null,
                };
                const linkToFunc: linkToFunction = (streamId: string, event: Event, metadata: Metadata) => {
                    passedInMetadata = metadata;
                };
                await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    const streamsCollection: streamCollection = {};

                    const eventToIgnore = { data: 'my event2', eventType: 'myOtherEventType', metadata: null };

                    streamsCollection.my_stream = { streamId: 'my_stream', events: [eventToProcess, eventToIgnore] };

                    const projection = new InMemoryProjection(streamsCollection);
                    projection.fromStream('my_stream').when(funct(emitFunc, linkToFunc));
                });
                expect(JSON.stringify(passedInMetadata)).toBe(JSON.stringify({ newMetatDataField: 'bla' }));
            });
        });
    });
});
