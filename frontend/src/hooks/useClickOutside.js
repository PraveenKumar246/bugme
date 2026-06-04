import { useEffect, useRef } from 'react';

/**
 * Fires `callback` when a mousedown event occurs outside ALL provided refs.
 *
 * @param {React.RefObject | React.RefObject[]} refs  - one ref or an array of refs
 * @param {() => void} callback
 *
 * Usage (single ref):
 *   const ref = useRef(null);
 *   useClickOutside(ref, () => setOpen(false));
 *
 * Usage (multiple refs — click inside ANY of them is ignored):
 *   useClickOutside([panelRef, triggerRef], () => setOpen(false));
 */
export function useClickOutside(refs, callback) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    const refsArray = Array.isArray(refs) ? refs : [refs];

    function handle(e) {
      const isInside = refsArray.some(
        r => r.current && r.current.contains(e.target)
      );
      if (!isInside) cbRef.current();
    }

    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [refs]);
}
