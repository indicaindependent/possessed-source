import { useEffect } from 'react';
import { saveHauntRecord } from '@/lib/possessed/hauntRecord';

export default function SaveHauntRecord({ view }) {
  useEffect(() => {
    const save = () => { saveHauntRecord(view); window.dispatchEvent(new Event('possessed:record')); };
    // Serialize two local tabs completing at once, without counting a reconnect twice.
    if (navigator.locks) void navigator.locks.request('possessed.record', save);
    else save();
  }, [view]);
  return null;
}