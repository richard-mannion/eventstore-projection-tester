export const funct = (emit, linkTo) => {
  return {
    $init: () => { },
    myEventType: (s, e) => {
      linkTo('next_stream', e, { created: e.created });
    }
  }
};