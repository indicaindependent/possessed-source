// Keep event-only paths separate from active-phase state, scoped to this room connection.
export default function resultReveals() {
  let matchNo = null;
  let results = [];
  return {
    receive(event) {
      if (event.kind !== 'round_result' && event.kind !== 'final') return;
      matchNo = event.matchNo;
      results = event.kind === 'final' ? event.results : [event.result];
    },
    attach(view) {
      if (!['intermission', 'final'].includes(view.phase) || view.matchNo !== matchNo) return view;
      return { ...view, results: view.results.map((result) => {
        const reveal = results.find((r) => r.round === result.round);
        return reveal ? { ...result, path: reveal.path } : result;
      }) };
    },
  };
}