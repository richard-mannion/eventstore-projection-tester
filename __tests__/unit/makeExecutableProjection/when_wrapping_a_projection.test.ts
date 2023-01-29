import { wrapExecutableProjection } from '../../../src/makeExecutableProjection';

describe('when making an executable projection', () => {
    const input = `fromStream("listings").when({})`;
    const expectedOutput = `exports.executableProjection = (emit, linkTo, fromStream, fromStreams, fromCategory) => {
  fromStream("listings").when({})
};`;

    it('should wrap the input function with a function that passes in required functions', async () => {
        const output = wrapExecutableProjection(input);
        expect(output).toBe(expectedOutput);
    });
});
