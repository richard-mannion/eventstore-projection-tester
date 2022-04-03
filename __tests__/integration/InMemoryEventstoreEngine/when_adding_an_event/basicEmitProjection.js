from('my_stream').when({
  $init: () => { },
  myEventType: (s, e) => {
    emit('next_emit_stream', 'NextEventType', e.data, e.metadata);
  }
})