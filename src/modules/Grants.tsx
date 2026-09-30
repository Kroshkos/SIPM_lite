import { useState } from 'react';
import { useStore } from '../store';
import { Grant, GrantStatus } from '../types';
import { Plus, X, DollarSign, Calendar } from 'lucide-react';

const statusConfig: Record<GrantStatus, { label: string; color: string }> = {
  preparation: { label: 'Подготовка', color: 'bg-gray-400' },
  submitted: { label: 'Подан', color: 'bg-blue-500' },
  expertise: { label: 'На экспертизе', color: 'bg-yellow-500' },
  awarded: { label: 'Получен', color: 'bg-green-500' },
  executing: { label: 'Исполняется', color: 'bg-blue-600' },
  reporting: { label: 'Отчётность', color: 'bg-orange-500' },
  completed: { label: 'Завершён', color: 'bg-green-600' },
  rejected: { label: 'Отклонён', color: 'bg-red-500' },
};

function GrantForm({ grant, onClose }: { grant?: Grant; onClose: () => void }) {
  const addGrant = useStore(s => s.addGrant);
  const updateGrant = useStore(s => s.updateGrant);
  const currentUser = useStore(s => s.currentUser);

  const [form, setForm] = useState({
    name: grant?.name || '',
    status: grant?.status || 'preparation' as GrantStatus,
    amount: grant?.amount || 0,
    spent: grant?.spent || 0,
    startDate: grant?.startDate || '',
    endDate: grant?.endDate || '',
    manager: grant?.manager || currentUser || '',
    stages: grant?.stages || [] as Grant['stages'],
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (grant) {
      updateGrant(grant.id, form);
    } else {
      addGrant(form);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">{grant ? 'Редактировать грант' : 'Новый грант'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Статус</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as GrantStatus }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none">
                {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Руководитель</label>
              <input value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Сумма (₽)</label>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Освоено (₽)</label>
              <input type="number" value={form.spent} onChange={e => setForm(f => ({ ...f, spent: +e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата начала</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата окончания</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">Отмена</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-xl text-sm bg-blue-500 text-white hover:bg-blue-600 font-medium">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

export function GrantsModule() {
  const grants = useStore(s => s.grants);
  const deleteGrant = useStore(s => s.deleteGrant);
  const [showForm, setShowForm] = useState(false);
  const [editGrant, setEditGrant] = useState<Grant | undefined>();

  const totalAmount = grants.reduce((sum, g) => sum + g.amount, 0);
  const totalSpent = grants.reduce((sum, g) => sum + g.spent, 0);

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Гранты ({grants.length})</h2>
        <button onClick={() => { setEditGrant(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25">
          <Plus size={16} /> Новый грант
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400">Общая сумма</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{totalAmount.toLocaleString('ru')} ₽</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400">Освоено</p>
          <p className="text-lg font-bold text-green-600">{totalSpent.toLocaleString('ru')} ₽</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400">Остаток</p>
          <p className="text-lg font-bold text-blue-600">{(totalAmount - totalSpent).toLocaleString('ru')} ₽</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400">% освоения</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{totalAmount > 0 ? Math.round((totalSpent / totalAmount) * 100) : 0}%</p>
        </div>
      </div>

      {grants.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
          <DollarSign size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">Нет грантов. Создайте первый грант.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grants.map(g => {
            const progress = g.amount > 0 ? Math.round((g.spent / g.amount) * 100) : 0;
            return (
              <div key={g.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{g.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{g.manager} • {g.startDate} — {g.endDate}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${statusConfig[g.status].color}`}>
                    {statusConfig[g.status].label}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Освоение</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div className={`h-2 rounded-full ${progress > 90 ? 'bg-red-500' : progress > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{g.spent.toLocaleString('ru')} ₽</p>
                    <p className="text-xs text-gray-400">из {g.amount.toLocaleString('ru')} ₽</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                  <button onClick={() => { setEditGrant(g); setShowForm(true); }} className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">Изменить</button>
                  <button onClick={() => { if (confirm('Удалить грант?')) deleteGrant(g.id); }} className="text-xs text-red-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">Удалить</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && <GrantForm grant={editGrant} onClose={() => { setShowForm(false); setEditGrant(undefined); }} />}
    </div>
  );
}
