export const getStreamNamesFromCategoryName = (streamNames: Array<string>, categoryName: string): Array<string> => {
    const category = `${categoryName}-`;
    return streamNames.filter((streamName) => streamName.startsWith(category));
};
