import { InMemoryEventstoreEngine } from '../../../../src';
import { runEventstoreEngine } from '../../../../src/runEventstoreEngine';
describe('when adding a projectioj', () => {
    describe('when there is one matching projection with emit', () => {
        describe('when adding one event', () => {
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
        });
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
                expect(engineResult.getTotalEvents()).toBe(4);
            });
        });
    });

    describe('when there is one matching projection with linTo', () => {
        describe('when adding one event', () => {
            it('should add the event and emit a new one', async () => {
                const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    await engine.addProjection(
                        'myProjection',
                        `fromStream('my_stream').when({
                        $init: () => { },
                        myEventType: (s, e) => {
                          linkTo('next_emit_stream', e, {});
                        }
                      })`,
                    );
                    engine.addEvent('my_stream', 'myEventType', { myField: 123 }, null);
                });
                expect(engineResult.getTotalEvents()).toBe(2);
            });
        });
        describe('when adding two events', () => {
            it('should add the events and emit a 2 new ones', async () => {
                const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    await engine.addProjection(
                        'myProjection',
                        `fromStream('my_stream').when({
                        $init: () => { },
                        myEventType: (s, e) => {
                            linkTo('next_emit_stream', e, {});
                        }
                      })`,
                    );
                    engine.addEvent('my_stream', 'myEventType', { myField: 123 }, null);
                    engine.addEvent('my_stream', 'myEventType', { myField: 124 }, null);
                });
                expect(engineResult.getTotalEvents()).toBe(4);
            });
        });
    });
});
