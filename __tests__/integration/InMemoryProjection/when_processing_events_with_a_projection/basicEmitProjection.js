export const funct = (emit, eventstoreEngine) => {
  return {
    $init: () => { },
    myEventType: (s, e) => {
      emit('next_stream', 'NextEventType', e.data, e.metadata);
    }
  }
};