import { useLayoutEffect, useRef, useState } from 'react';
import { useSize } from '@/hooks/use-size';

const PAD = 3; // viewBox units of breathing room around the drawing

// Pixel box of a prop's visible drawing inside its 100x100 "xMidYMax meet" SVG,
// so outlines and badges hug the artwork instead of the whole tap target.
export default function useArtFrame() {
  const boxRef = useRef(null);
  const artRef = useRef(null);
  const size = useSize(boxRef);
  const [bb, setBb] = useState(null);

  useLayoutEffect(() => {
    const b = artRef.current?.getBBox?.();
    if (b && b.width) setBb({ x: b.x, y: b.y, width: b.width, height: b.height });
  }, []);

  let style = { inset: 0 };
  if (size && bb) {
    const s = Math.min(size.width, size.height) / 100;
    const ox = (size.width - 100 * s) / 2;
    const oy = size.height - 100 * s;
    const x0 = Math.max(0, bb.x - PAD);
    const y0 = Math.max(0, bb.y - PAD);
    const x1 = Math.min(100, bb.x + bb.width + PAD);
    const y1 = Math.min(100, bb.y + bb.height + PAD);
    style = { left: ox + x0 * s, top: oy + y0 * s, width: (x1 - x0) * s, height: (y1 - y0) * s };
  }
  return { boxRef, artRef, style };
}