import { InMemoryEventstoreEngine } from '../../../../src';
import { runEventstoreEngine } from '../../../../src/runEventstoreEngine';
describe('when adding a projectioj', () => {
    describe('when there is one matching projection', () => {
        describe('should only reult in one event being added', () => {
            it('should add the event to a new stream', async () => {
                const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);
                });
                expect(engineResult.getTotalEvents()).toBe(1);
            });
        });
        describe('when there are two events', () => {
            it('should add the event to a new stream', async () => {
                const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);
                    engine.addEvent('my_stream', 'MyEventType', { myField: 234 }, null);
                });
                expect(engineResult.getEventsForStream('my_stream')).toHaveLength(2);
            });
        });
    });
});
