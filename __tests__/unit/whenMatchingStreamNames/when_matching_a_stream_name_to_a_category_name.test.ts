import { getStreamNamesFromCategoryName } from '../../../src/getStreamNamesFromCategoryName';

describe('when matching a stream name to a category name', () => {
    describe('when no stream names match', () => {
        it('should match return an empty array', async () => {
            const expected: Array<string> = [];
            const result = getStreamNamesFromCategoryName(['stream1', 'stream2'], 'stream3');
            expect(result).toStrictEqual(expected);
        });
    });
    describe('when 1 stream names matches', () => {
        it('should match return one item', async () => {
            const expected: Array<string> = ['stream-123'];
            const result = getStreamNamesFromCategoryName(['stream-123', 'stream2'], 'stream');
            expect(result).toStrictEqual(expected);
        });
    });
});
