import { useState } from 'react';
import { useStore } from '../store';
import { Indicator } from '../types';
import { Plus, X, TrendingUp, TrendingDown } from 'lucide-react';

function IndicatorForm({ indicator, onClose }: { indicator?: Indicator; onClose: () => void }) {
  const addIndicator = useStore(s => s.addIndicator);
  const updateIndicator = useStore(s => s.updateIndicator);
  const currentUser = useStore(s => s.currentUser);

  const [form, setForm] = useState({
    name: indicator?.name || '',
    unit: indicator?.unit || '',
    planValue: indicator?.planValue || 0,
    factValue: indicator?.factValue || 0,
    year: indicator?.year || new Date().getFullYear(),
    responsible: indicator?.responsible || currentUser || '',
    docIds: indicator?.docIds || [] as string[],
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (indicator) {
      updateIndicator(indicator.id, form);
    } else {
      addIndicator(form);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">{indicator ? 'Редактировать показатель' : 'Новый показатель'}</h3>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ед. измерения</label>
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Год</label>
              <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: +e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">План</label>
              <input type="number" value={form.planValue} onChange={e => setForm(f => ({ ...f, planValue: +e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Факт</label>
              <input type="number" value={form.factValue} onChange={e => setForm(f => ({ ...f, factValue: +e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ответственный</label>
            <input value={form.responsible} onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
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

export function Priority2030Module() {
  const indicators = useStore(s => s.indicators);
  const deleteIndicator = useStore(s => s.deleteIndicator);
  const [showForm, setShowForm] = useState(false);
  const [editInd, setEditInd] = useState<Indicator | undefined>();

  const onTrack = indicators.filter(i => i.planValue > 0 && (i.factValue / i.planValue) >= 0.8);
  const behind = indicators.filter(i => i.planValue > 0 && (i.factValue / i.planValue) < 0.8);

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Приоритет-2030</h2>
        <button onClick={() => { setEditInd(undefined); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 shadow-lg shadow-blue-500/25">
          <Plus size={16} /> Новый показатель
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400">Всего показателей</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{indicators.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400">В норме</p>
          <p className="text-xl font-bold text-green-600">{onTrack.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400">Отставание</p>
          <p className="text-xl font-bold text-red-600">{behind.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400">Ср. выполнение</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {indicators.length > 0 ? Math.round(indicators.reduce((s, i) => s + (i.planValue > 0 ? (i.factValue / i.planValue) * 100 : 0), 0) / indicators.length) : 0}%
          </p>
        </div>
      </div>

      {indicators.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
          <p className="text-gray-400">Нет показателей. Добавьте показатели программы Приоритет-2030.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Показатель</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ед.</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">План</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Факт</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">%</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ответственный</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {indicators.map(i => {
                  const pct = i.planValue > 0 ? Math.round((i.factValue / i.planValue) * 100) : 0;
                  return (
                    <tr key={i.id} className="border-t border-gray-50 dark:border-gray-700">
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{i.name}</td>
                      <td className="px-4 py-3 text-gray-500">{i.unit}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{i.planValue}</td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{i.factValue}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {pct >= 80 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{i.responsible}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => { setEditInd(i); setShowForm(true); }} className="text-xs text-blue-500 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">✏️</button>
                          <button onClick={() => { if (confirm('Удалить?')) deleteIndicator(i.id); }} className="text-xs text-red-400 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="lg:hidden divide-y divide-gray-50 dark:divide-gray-700">
            {indicators.map(i => {
              const pct = i.planValue > 0 ? Math.round((i.factValue / i.planValue) * 100) : 0;
              return (
                <div key={i.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{i.name}</p>
                      <p className="text-xs text-gray-400">{i.responsible} • {i.year}</p>
                    </div>
                    <span className={`text-sm font-bold ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{pct}%</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>План: {i.planValue} {i.unit}</span>
                    <span>Факт: {i.factValue} {i.unit}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => { setEditInd(i); setShowForm(true); }} className="text-xs text-blue-500">Изменить</button>
                    <button onClick={() => { if (confirm('Удалить?')) deleteIndicator(i.id); }} className="text-xs text-red-400">Удалить</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && <IndicatorForm indicator={editInd} onClose={() => { setShowForm(false); setEditInd(undefined); }} />}
    </div>
  );
}
