import { InMemoryEventstoreEngine } from '../../../../src';
describe('when adding an event', () => {
    describe('when there are no projections', () => {
        describe('when there are no existing events', () => {
            const engine = new InMemoryEventstoreEngine('');
            engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);
            it('should add the event to a new stream', async () => {
                expect(engine.getEventsForStream('my_stream')).toHaveLength(1);
            });
            it('should only reult in one event being added', async () => {
                expect(engine.getTotalEvents()).toBe(1);
            });
        });

        describe('when there are existing events in another stream', () => {
            const engine = new InMemoryEventstoreEngine('');
            engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);
            engine.addEvent('my_other_stream', 'MyEventType', { myField: 123 }, null);

            it('should add the event to a new stream', async () => {
                expect(engine.getEventsForStream('my_other_stream')).toHaveLength(1);
            });
            it('should not affect any other streams', async () => {
                expect(engine.getEventsForStream('my_stream')).toHaveLength(1);
                expect(engine.getTotalEvents()).toBe(2);
                expect(engine.getStreamNames()).toHaveLength(2);
            });
        });

        describe('when there are existing events in the stream to be added to', () => {
            const engine = new InMemoryEventstoreEngine('');
            engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);
            engine.addEvent('my_stream', 'MyEventType', { myField: 123 }, null);

            it('should add the event to the existing stream', async () => {
                expect(engine.getEventsForStream('my_stream')).toHaveLength(2);
                expect(engine.getTotalEvents()).toBe(2);
                expect(engine.getStreamNames()).toHaveLength(1);
            });
        });
    });
});
