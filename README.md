# Eventstore projection testing framework

## What this library is

This is a testing framework for eventstore projections. This can be used to execute eventstore projections and there are a number of tools to easily get access to the data inside the streams

## What this library is not

An in memory version of eventstore. This implements the features of eventstore, but it does not implement it in the same way that eventstore does. Eventstore sees state and a position of a projection in a stream as just another stream, but for simplicity, this library does not do that.

## Features included

-   fromStream
-   fromCategory
-   foreachStream

## How to use

### Adding a projection

```javascript
const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
    await engine.addProjection('my_projection', 'fromStream("listings").when({});');
});
```

### Adding an event

```javascript
const newEventStreamName = 'next_emit_stream';
const newEventType = 'NextEventType';
const myField = 123;
const expectedEvent = {
    data: { newField: 'a value', myField },
    metadata: { metadataField: 3 },
    eventType: newEventType,
    created: 2,
};
const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
    engine.addEvent('my_stream', 'myEventType', { myField }, null);
});
```

## Testing the results

```javascript
const newEventStreamName = 'next_emit_stream';
const newEventType = 'NextEventType';
const myField = 123;
const expectedEvent = {
    data: { newField: 'a value', myField },
    metadata: { metadataField: 3 },
    eventType: newEventType,
    created: 2,
};
const engineResult = await runEventstoreEngine(async (engine: InMemoryEventstoreEngine) => {
    await engine.addProjection(
        'myProjection',
        `fromStream('my_stream').when({
        $init: () => { },
        myEventType: (s, e) => {
            let newData = {newField:'a value', myField:e.data.myField};
          emit('${newEventStreamName}', '${newEventType}', newData, {metadataField:3});
        }
      })`,
    );
    engine.addEvent('my_stream', 'myEventType', { myField }, null);
});
expect(engineResult.getTotalEvents()).toBe(2);
expect(engineResult.getEventsForStream(newEventStreamName)).toEqual([expectedEvent]);
```

## Engine Functionality

| Method                                                                               | Function                                                            |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `addProjection (projectionName: string, projection: string ) : Promise<void>`        | Gets the total number of projections in the current engine instance |
| `addEvent(streamId: string, eventType: string, data: any, metadata: Metadata): void` | Adds an event to a stream and executes all projections              |

## Engine Result functionality

| Method                                   | Function                                                            |
| ---------------------------------------- | ------------------------------------------------------------------- |
| `getTotalProjections()`                  | Gets the total number of projections in the current engine instance |
| `getTotalEvents()`                       | Gets the total number of events in all streams                      |
| `getStreamNames()`                       | Gets a list of the stream names                                     |
| `getEventsForStream(streamName: string)` | Gets a list of events for a specific stream name                    |
| `getEvents()`                            | Gets a listi og all events on all streams                           |

## Timing

All events in Eventstore have a field called `created`. This field is used to process events in the correct order. To make this library simpler, the created is treated as a number that increments with eacj event added or emitted vie `emit` or `linkTo`. This way you can calculate the expected value per event.
