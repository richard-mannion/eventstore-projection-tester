import { InMemoryEventstoreEngine } from '../../../../src';
import { runEventstoreEngine } from '../../../../src/runEventstoreEngine';
describe('when adding a projectioj', () => {
    describe('when there is one matching projection with emit', () => {
        /*describe('when adding one event', () => {
            it('should add the event and emit a new one', async () => {
                const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    await engine.addProjection(
                        'myProjection',
                        `fromStream('my_stream').when({
                        $init: () => { },
                        myEventType: (s, e) => {
                          emit('next_emit_stream', 'NextEventType', e.data, e.metadata);
                        }
                      })`,
                    );
                    engine.addEvent('my_stream', 'myEventType', { myField: 123 }, null);
                });
                expect(engineResult.getTotalEvents()).toBe(2);
            });
        });*/
        describe('when adding two events', () => {
            it('should add the events and emit a 2 new ones', async () => {
                const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    await engine.addProjection(
                        'myProjection',
                        `fromStream('my_stream').when({
                        $init: () => { },
                        myEventType: (s, e) => {
                          emit('next_emit_stream', 'NextEventType', e.data, e.metadata);
                        }
                      })`,
                    );
                    engine.addEvent('my_stream', 'myEventType', { myField: 123 }, null);
                    engine.addEvent('my_stream', 'myEventType', { myField: 124 }, null);
                });
                console.log(engineResult.getEvents());
                expect(engineResult.getTotalEvents()).toBe(4);
            });
        });
        /*describe('when there are two events', () => {
            it('should add the event to a new stream', async () => {
                const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);
                    engine.addEvent('my_stream', 'MyEventType', { myField: 234 }, null);
                });
                expect(engineResult.getEventsForStream('my_stream')).toHaveLength(2);
            });
        });*/
    });
});
