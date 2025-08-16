// src/hooks/useCardTilt.js
import { useRef, useEffect } from 'react';

export default function useCardTilt(intensity = 13) {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function handlePointerMove(e) {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      el.style.transform =
        `rotateY(${x * intensity}deg) rotateX(${-y * intensity * 0.6}deg) scale(1.027)`;
    }
    function handlePointerLeave() { el.style.transform = ''; }
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerleave', handlePointerLeave);
    el.addEventListener('focus', handlePointerLeave);
    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerleave', handlePointerLeave);
      el.removeEventListener('focus', handlePointerLeave);
    };
  }, [intensity]);
  return ref;
}
