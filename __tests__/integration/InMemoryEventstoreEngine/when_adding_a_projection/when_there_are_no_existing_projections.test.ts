import { InMemoryEventstoreEngine } from '../../../../src';
import { runEventstoreEngine } from '../../../../src/runEventstoreEngine';
import path from 'path';
import { v4 } from 'uuid';
describe('when adding a projection', () => {
    describe('when there are no projections', () => {
        describe('when there is one event', () => {
            it('should add the projection', async () => {
                const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    await engine.addProjection('my_projection', 'fromStream("listings").when({});');
                });
                expect(engineResult.getTotalProjections()).toBe(1);
            });
        });
        describe('when there is one existing projection', () => {
            it('should add the projection', async () => {
                const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
                    await engine.addProjection('my_projection', 'fromStream("listings").when({});');
                    await engine.addProjection('my_other_projection', 'fromStream("listings").when({});');
                });
                expect(engineResult.getTotalProjections()).toBe(2);
            });
        });
    });
});
