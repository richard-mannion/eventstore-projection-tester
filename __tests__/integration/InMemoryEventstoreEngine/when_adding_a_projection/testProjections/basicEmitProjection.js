export const funct = (emit) => {
  return {
    $init: () => { },
    myEventType: (s, e) => {
      emit('next_stream', 'NextEventType', e.data, e.metadata);
    }
  }
};