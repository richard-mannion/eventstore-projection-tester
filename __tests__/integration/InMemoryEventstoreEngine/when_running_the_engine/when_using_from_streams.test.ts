import { EventstoreEngine, InMemoryEventstoreEngine } from '../../../../src';
import { runEventstoreEngine } from '../../../../src/runEventstoreEngine';

describe('when running the engine', () => {
    describe('when using fromStreams', () => {
        it('should add the event and emit a new one', async () => {
            const newEventStreamName = 'next_emit_stream';
            const newEventType = 'NextEventType';
            const myField = 123;
            const engineResult = await runEventstoreEngine(async (engine: EventstoreEngine) => {
                await engine.addProjection(
                    'myProjection',
                    `fromStreams(['my_stream']).when({
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
        });
    });
});
