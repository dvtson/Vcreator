import { LeaderboardEntriesTransfer } from '../../components/common/LeaderboardEntriesTransfer';
import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Plus,
  Save,
  Trash2,
  Calendar,
  AlertCircle,
  Building,
  User,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { saveLeaderboard, deleteLeaderboard } from '../../services/storageService';
import { LeaderboardPeriod, LeaderboardEntry } from '../../types';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ToastContainer, ToastMessage } from '../../components/common/Toast';

export const AdminLeaderboardsPage: React.FC = () => {
  const { leaderboards } = useData();

  const [activeType, setActiveType] = useState<'personal' | 'collective'>('personal');
  const filteredPeriods = leaderboards.filter((l) => l.type === activeType);

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>(
    filteredPeriods[0]?.id || ''
  );

  const [currentPeriod, setCurrentPeriod] = useState<LeaderboardPeriod | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingPeriod, setDeletingPeriod] = useState<LeaderboardPeriod | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const list = leaderboards.filter((l) => l.type === activeType);
    if (!selectedPeriodId || !list.some((p) => p.id === selectedPeriodId)) {
      if (list[0]) {
        setSelectedPeriodId(list[0].id);
        setCurrentPeriod(list[0]);
      } else {
        setSelectedPeriodId('');
        setCurrentPeriod(null);
      }
    } else {
      const found = list.find((p) => p.id === selectedPeriodId);
      if (found) setCurrentPeriod(found);
    }
  }, [activeType, leaderboards, selectedPeriodId]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const toastId = Date.now().toString();
    setToasts((prev) => [...prev, { id: toastId, type, text }]);
  };

  const removeToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleAddNewPeriod = () => {
    const id = `lb_${activeType}_${Date.now()}`;
    const newPeriod: LeaderboardPeriod = {
      id,
      type: activeType,
      periodCode: `KY-MOI-${Date.now().toString().slice(-4)}`,
      periodName: `Kỳ mới (${activeType === 'personal' ? 'Cá nhân' : 'Tập thể'})`,
      statusLabel: 'tam_tinh',
      updatedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      evaluationNote: 'Dữ liệu demo do Admin cập nhật để kiểm thử bảng xếp hạng.',
      entries: [
        {
          id: 'e1',
          rank: 1,
          name: activeType === 'personal' ? 'Nguyễn Văn A' : 'VRB Sở Giao Dịch',
          branch: activeType === 'personal' ? 'VRB Sở Giao Dịch' : undefined,
          score: 100,
          awardWon: 'Hạng Nhất',
        },
      ],
    };
    saveLeaderboard(newPeriod).then(() => {
      setSelectedPeriodId(id);
      setCurrentPeriod(newPeriod);
      addToast('success', 'Đã tạo kỳ bảng xếp hạng mới!');
    });
  };

  const handleAddEntryRow = () => {
    if (!currentPeriod) return;
    const nextRank = (currentPeriod.entries?.length || 0) + 1;
    const newEntry: LeaderboardEntry = {
      id: 'row_' + Date.now(),
      rank: nextRank,
      name: '',
      branch: activeType === 'personal' ? 'VRB' : undefined,
      score: 0,
      awardWon: '',
    };
    setCurrentPeriod({
      ...currentPeriod,
      entries: [...(currentPeriod.entries || []), newEntry],
    });
  };

  const handleEntryChange = (index: number, field: keyof LeaderboardEntry, val: any) => {
    if (!currentPeriod) return;
    const updatedEntries = [...currentPeriod.entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: val,
    };
    setCurrentPeriod({
      ...currentPeriod,
      entries: updatedEntries,
    });
  };

  const handleRemoveEntry = (index: number) => {
    if (!currentPeriod) return;
    const updatedEntries = currentPeriod.entries.filter((_, i) => i !== index);
    // Re-index ranks
    const reindexed = updatedEntries.map((item, idx) => ({ ...item, rank: idx + 1 }));
    setCurrentPeriod({
      ...currentPeriod,
      entries: reindexed,
    });
  };

  const handleSavePeriod = async () => {
    if (!currentPeriod) return;
    setIsSaving(true);
    try {
      const toSave: LeaderboardPeriod = {
        ...currentPeriod,
        updatedAt:
          new Date().toLocaleDateString('vi-VN') +
          ' ' +
          new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      await saveLeaderboard(toSave);
      setCurrentPeriod(toSave);
      addToast('success', 'Đã lưu kết quả bảng xếp hạng thành công!');
    } catch (err) {
      console.error(err);
      addToast('error', 'Có lỗi khi lưu bảng xếp hạng.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeletePeriod = async () => {
    if (!deletingPeriod) return;
    try {
      await deleteLeaderboard(deletingPeriod.id);
      addToast('success', `Đã xóa kỳ "${deletingPeriod.periodName}".`);
      setDeletingPeriod(null);
    } catch (err) {
      console.error(err);
      addToast('error', 'Không thể xóa kỳ bảng xếp hạng.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản trị Bảng Xếp Hạng
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Nhập và điều chỉnh điểm số thi đua cá nhân và tập thể theo từng kỳ đánh giá.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddNewPeriod}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm kỳ xét mới</span>
          </button>

          {currentPeriod && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSavePeriod}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vrb-blue hover:bg-vrb-blue-dark text-white font-bold text-xs shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu bảng điểm'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Type Tabs: Personal vs Collective */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveType('personal')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
            activeType === 'personal'
              ? 'border-vrb-blue text-vrb-blue bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Bảng xếp hạng Cá nhân</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveType('collective')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-bold border-b-2 transition-all ${
            activeType === 'collective'
              ? 'border-vrb-red text-vrb-red bg-white shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Bảng xếp hạng Tập thể Chi nhánh</span>
        </button>
      </div>

      {/* Period Configuration Bar */}
      {currentPeriod ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Chọn kỳ làm việc:</span>
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 outline-none focus:border-vrb-blue"
              >
                {filteredPeriods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.periodName} ({p.statusLabel === 'chinh_thuc' ? 'Chính thức' : 'Tạm tính'})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setDeletingPeriod(currentPeriod)}
              className="text-xs text-red-600 hover:text-red-700 font-semibold p-1.5 rounded-lg hover:bg-red-50 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa kỳ xét này
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên hiển thị kỳ xét</label>
              <input
                type="text"
                value={currentPeriod.periodName}
                onChange={(e) => setCurrentPeriod({ ...currentPeriod, periodName: e.target.value })}
                placeholder="Ví dụ: Kỳ 1 - Tháng 11/2026"
                className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái số liệu</label>
              <select
                value={currentPeriod.statusLabel}
                onChange={(e) =>
                  setCurrentPeriod({ ...currentPeriod, statusLabel: e.target.value as any })
                }
                className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue font-semibold"
              >
                <option value="tam_tinh">Dữ liệu Tạm tính (Chưa chốt)</option>
                <option value="chinh_thuc">Kết quả Chính thức</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú phương pháp xét thưởng / Lưu ý demo</label>
            <input
              type="text"
              value={currentPeriod.evaluationNote}
              onChange={(e) => setCurrentPeriod({ ...currentPeriod, evaluationNote: e.target.value })}
              placeholder="Dữ liệu demo phục vụ kiểm thử..."
              className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-vrb-blue"
            />
          </div>

          <LeaderboardEntriesTransfer key={currentPeriod.id} period={currentPeriod} onChange={entries=>setCurrentPeriod({...currentPeriod,entries})} />
          {/* Table of Entries */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Danh sách thứ hạng ({currentPeriod.entries?.length || 0} dòng)
              </h3>
              <button
                type="button"
                onClick={handleAddEntryRow}
                className="px-3 py-1.5 bg-blue-50 text-vrb-blue hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm dòng
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full min-w-[720px] text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3 w-16 text-center">Hạng</th>
                    <th className="py-2.5 px-3">{activeType === 'personal' ? 'Họ tên cán bộ' : 'Tên Chi nhánh'}</th>
                    {activeType === 'personal' && <th className="py-2.5 px-3">Chi nhánh</th>}
                    <th className="py-2.5 px-3 w-28 text-right">Điểm số</th>
                    <th className="py-2.5 px-3">Giải / Danh hiệu</th>
                    <th className="py-2.5 px-3 w-12 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentPeriod.entries?.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          value={row.rank}
                          onChange={(e) => handleEntryChange(idx, 'rank', parseInt(e.target.value) || 1)}
                          className="w-12 text-center text-xs font-bold border border-slate-200 rounded p-1"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleEntryChange(idx, 'name', e.target.value)}
                          placeholder="Họ tên hoặc tên Đơn vị"
                          className="w-full text-xs font-semibold border border-slate-200 rounded p-1"
                        />
                      </td>

                      {activeType === 'personal' && (
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.branch || ''}
                            onChange={(e) => handleEntryChange(idx, 'branch', e.target.value)}
                            placeholder="Chi nhánh..."
                            className="w-full text-xs border border-slate-200 rounded p-1"
                          />
                        </td>
                      )}

                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          step="0.1"
                          value={row.score}
                          onChange={(e) => handleEntryChange(idx, 'score', parseFloat(e.target.value) || 0)}
                          className="w-20 text-right text-xs font-bold text-vrb-blue border border-slate-200 rounded p-1 font-mono"
                        />
                      </td>

                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.awardWon || ''}
                          onChange={(e) => handleEntryChange(idx, 'awardWon', e.target.value)}
                          placeholder="Top 1 Lan Tỏa..."
                          className="w-full text-xs border border-slate-200 rounded p-1"
                        />
                      </td>

                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveEntry(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSavePeriod}
              className="px-6 py-2.5 rounded-xl bg-vrb-blue hover:bg-vrb-blue-dark text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu toàn bộ bảng xếp hạng'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-xs text-slate-500">
          Chưa có kỳ nào. Hãy nhấn "Thêm kỳ xét mới" ở phía trên để bắt đầu nhập dữ liệu.
        </div>
      )}

      <ConfirmModal
        isOpen={!!deletingPeriod}
        title="Xác nhận xóa kỳ bảng xếp hạng"
        message="Toàn bộ điểm số và danh sách thứ hạng của kỳ này sẽ bị xóa khỏi cơ sở dữ liệu."
        itemName={deletingPeriod?.periodName}
        confirmLabel="Xóa kỳ này"
        onConfirm={confirmDeletePeriod}
        onCancel={() => setDeletingPeriod(null)}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
