import { useLayoutEffect, useRef, useState } from 'react';

type ListPosition = { current: { top: number; trigger: HTMLElement | null } };

export function useAdminEditorState<T>() {
  const [value, setValue] = useState<T | null>(null);
  const returnTo = useRef({ top: 0, trigger: null as HTMLElement | null });
  const setEditor = (next: T | null) => {
    if (!value && next) {
      returnTo.current = {
        top: document.querySelector('main')?.scrollTop ?? 0,
        trigger: document.activeElement instanceof HTMLElement ? document.activeElement : null,
      };
    }
    setValue(next);
  };
  return [value, setEditor, returnTo] as const;
}

/** Switch between list and editor in the admin's own scrolling container. */
export function AdminEditorNavigation({ editing, isNew, busy, onClose, returnTo }: {
  editing: boolean;
  isNew: boolean;
  busy: boolean;
  onClose: () => void;
  returnTo: ListPosition;
}) {
  const navigation = useRef<HTMLElement>(null);
  const previous = useRef(false);

  useLayoutEffect(() => {
    const main = navigation.current?.closest('main');
    if (!main || previous.current === editing) return;
    previous.current = editing;
    if (editing) {
      main.scrollTo({ top: 0, behavior: 'instant' });
      navigation.current?.parentElement?.querySelector<HTMLElement>('form input:not([type="hidden"]), form textarea, form select')?.focus({ preventScroll: true });
    } else {
      main.scrollTo({ top: returnTo.current.top, behavior: 'instant' });
      if (returnTo.current.trigger?.isConnected) returnTo.current.trigger.focus({ preventScroll: true });
    }
  }, [editing, returnTo]);

  return (
    <nav ref={navigation} aria-label="Danh sách và chỉnh sửa" className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
      <button type="button" disabled={busy} onClick={onClose} aria-current={!editing ? 'page' : undefined}
        className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${!editing ? 'bg-vrb-blue text-white' : 'bg-white border border-slate-200 text-vrb-blue hover:bg-blue-50'}`}>
        {editing ? '← Quay lại danh sách' : 'Danh sách'}
      </button>
      {editing && <span aria-current="page" className="rounded-xl bg-vrb-blue px-4 py-2.5 text-sm font-semibold text-white">{isNew ? 'Thêm mới' : 'Chỉnh sửa'}</span>}
      {busy && <span role="status" className="text-sm text-slate-500">Đang lưu…</span>}
    </nav>
  );
}
