import { useLayoutEffect, useState } from 'react';

// Measure the real prop art rather than assuming desktop or mobile room geometry.
export default function useRevealPositions(ref) {
  const [points, setPoints] = useState({});
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const measure = () => {
      const frame = root.getBoundingClientRect();
      if (!frame.width || !frame.height) return;
      const next = {};
      root.querySelectorAll('[data-prop]').forEach((prop) => {
        const box = prop.querySelector('.prop-art').getBoundingClientRect();
        next[prop.dataset.prop] = { x: (box.left + box.width / 2 - frame.left) / frame.width * 100, y: (box.top + box.height * .6 - frame.top) / frame.height * 100 };
      });
      setPoints(next);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    measure();
    return () => observer.disconnect();
  }, [ref]);
  return points;
}