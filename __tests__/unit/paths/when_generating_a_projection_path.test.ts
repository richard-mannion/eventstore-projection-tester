import { getEnginePath, getProjectionFilePath } from '../../../src/paths';

describe('when generating a temporay engine path', () => {
    it('should match the expected format', async () => {
        const expectedPathAndName = 'myRoot/.eventstore/engineid';
        const actualPathAndName = getEnginePath('myRoot', 'engineid');
        expect(actualPathAndName).toBe(expectedPathAndName);
    });
});

describe('when generating a temporay projection file path', () => {
    it('should match the expected format', async () => {
        const expectedPathAndName = 'engineid/my_projection.js';
        const actualPathAndName = getProjectionFilePath('engineid', 'my_projection');
        expect(actualPathAndName).toBe(expectedPathAndName);
    });
});
