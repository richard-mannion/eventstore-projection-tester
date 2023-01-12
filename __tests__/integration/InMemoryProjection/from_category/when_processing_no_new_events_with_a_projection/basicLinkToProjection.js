export const funct = (emit, linkTo) => {
  return {
    $init: () => { },
    myEventType: (s, e) => {
      console.log('##about to linkTo', linkTo)
      linkTo('next_stream', e, { EventId: e.EventId });
    }
  }
};