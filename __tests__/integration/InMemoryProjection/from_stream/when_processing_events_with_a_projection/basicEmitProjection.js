export const funct = (emit, linkTo) => {
  return {
    $init: () => { },
    myEventType: (s, e) => {
      emit('next_stream', 'NextEventType', e.data, e.metadata);
    }
  }
};