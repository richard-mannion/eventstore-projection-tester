import {
    CategoryAction,
    NoStreamAction,
    Projection,
    StreamAction,
    StreamCollection,
    StreamsAction,
} from './EventstoreEngine';
import { getStreamNamesFromCategoryName } from './getStreamNamesFromCategoryName';
import { InMemoryCategoryAction } from './InMemoryCategoryAction';
import { InMemoryStreamAction } from './InMemoryStreamAction';
import { InMemoryStreamsAction } from './InMemoryStreamsAction';

export class InMemoryProjection implements Projection {
    public streamAction: StreamAction | StreamsAction | CategoryAction | undefined;
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

    public fromStreams = (streamNames: Array<string>): StreamAction => {
        const getStreamNames = (): StreamCollection => {
            let streamCollection: StreamCollection = {};
            streamNames.forEach((key) => {
                if (this.streams[key]) {
                    streamCollection[key] = this.streams[key];
                }
            });
            return streamCollection;
        };
        if (!this.streamAction) {
            this.streamAction = new InMemoryStreamsAction(getStreamNames);
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
