import { InMemoryEventstoreEngine } from '../../../../src';
import { runEventstoreEngine } from '../../../../src/runEventstoreEngine';

describe('when adding a projectioj', () => {
    describe('when there is one matching projection with emit', () => {
        describe('when adding one event', () => {
            it('should add the event and emit a new one', async () => {
                const newEventStreamName = 'next_emit_stream';
                const newEventType = 'NextEventType';
                const myField = 123;
                const expectedEvent = {
                    data: { newField: 'a value', myField },
                    metadata: { metadataField: 3 },
                    eventType: newEventType,
                };
                const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    await engine.addProjection(
                        'myProjection',
                        `fromStream('my_stream').when({
                        $init: () => { },
                        myEventType: (s, e) => {
                            let newData = {newField:'a value', myField:e.data.myField};
                          emit('${newEventStreamName}', '${newEventType}', newData, {metadataField:3});
                        }
                      })`,
                    );
                    engine.addEvent('my_stream', 'myEventType', { myField }, null);
                });
                expect(engineResult.getTotalEvents()).toBe(2);
                expect(engineResult.getEventsForStream(newEventStreamName)).toEqual([expectedEvent]);
            });
        });
    });
});
