import { CategoryAction, NoStreamAction, Projection, StreamAction, StreamCollection } from './EventstoreEngine';
import { getStreamNamesFromCategoryName } from './getStreamNamesFromCategoryName';
import { InMemoryCategoryAction } from './InMemoryCategoryAction';
import { InMemoryStreamAction } from './InMemoryStreamAction';

export class InMemoryProjection implements Projection {
    public streamAction: StreamAction | CategoryAction | undefined;
    constructor(private streams: StreamCollection) {}
    public fromStream = (streamName: string): StreamAction => {
        const stream = this.streams[streamName];
        if (!stream) {
            return new NoStreamAction();
        }
        if (!this.streamAction) {
            this.streamAction = new InMemoryStreamAction(stream);
        }
        return this.streamAction;
    };

    public fromCategory = (categoryName: string): CategoryAction => {
        const getStreamNames = (): StreamCollection => {
            const streamNames = Object.keys(this.streams);
            const matchingStreamNames = getStreamNamesFromCategoryName(streamNames, categoryName);
            let streamCollection: StreamCollection = {};
            matchingStreamNames.forEach((key) => {
                streamCollection[key] = this.streams[key];
            });
            return streamCollection;
        };

        if (!this.streamAction) {
            this.streamAction = new InMemoryCategoryAction(getStreamNames);
        }
        return this.streamAction as CategoryAction;
    };
}
