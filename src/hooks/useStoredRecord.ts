import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';
import { DATA_CHANGED_EVENT } from '../services/storageService';
// Refresh independent detail/document views when another tab publishes or removes content.
export function useStoredRecord<T>(load: () => Promise<T | null>, key: string) {
  const auth = useAuth();
  const [value,setValue]=useState<T|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;let request=0;
    const refresh=async()=>{const token=++request;try{const next=await load();if(active&&token===request){setValue(next);setError('');}}catch{if(active&&token===request){setValue(null);setError('Không tải được dữ liệu. Vui lòng tải lại trang.');}}finally{if(active&&token===request)setLoading(false);}};
    setValue(null);setLoading(true);void refresh();
    const storage=(e:StorageEvent)=>{if(e.key===DATA_CHANGED_EVENT)void refresh();};
    const changed=()=>{void refresh();};
    window.addEventListener('storage',storage);window.addEventListener('focus',changed);window.addEventListener(DATA_CHANGED_EVENT,changed);
    return ()=>{active=false;window.removeEventListener('storage',storage);window.removeEventListener('focus',changed);window.removeEventListener(DATA_CHANGED_EVENT,changed);};
  // The key defines the requested record; callers pass a fresh loader during rendering.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[key,auth.user?.uid]);
  return {value,loading,error};
}
