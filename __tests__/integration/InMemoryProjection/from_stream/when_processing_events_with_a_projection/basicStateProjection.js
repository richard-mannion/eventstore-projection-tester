export const funct = (emit, linkTo) => {
  return {
    $init: () => { return { eventsProcessed: 0 } },
    myEventType: (s, e) => {
      s.eventsProcessed += 1;
    }
  }
};