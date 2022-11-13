import { Stream, StreamPointer } from './EventstoreEngine';

export const getNextStreamPointer = (stream: Stream, streamPointer: StreamPointer): number | undefined => {
    if (stream.events.length === 0) {
        return;
    }
    if (streamPointer === undefined) {
        streamPointer = 'START';
    }
    if (streamPointer === stream.events.length - 1) {
        return;
    }

    return streamPointer === 'START' ? 0 : streamPointer + 1;
};
